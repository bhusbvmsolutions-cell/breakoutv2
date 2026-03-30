const db = require('../../../models');
const slugify = require('slugify');
const { Op } = require('sequelize');

// Helper: Build venue filter conditions from selected options
async function buildVenueFilters(selectedOptions) {
  const filters = {
    category_ids: [],
    budget_range_ids: [],
    experience_type_ids: [],
    party_type_ids: [],
    suitable_time_ids: [],
    looking_for_ids: [],
    location_ids: []
  };

  for (const opt of selectedOptions) {
    if (opt.filter_data) {
      for (const key of Object.keys(filters)) {
        if (opt.filter_data[key] && Array.isArray(opt.filter_data[key])) {
          filters[key].push(...opt.filter_data[key]);
        }
      }
    }
  }

  // Remove duplicates
  for (const key of Object.keys(filters)) {
    filters[key] = [...new Set(filters[key])];
  }

  // Build Sequelize where condition
  const where = {};
  const include = [];

  if (filters.category_ids.length) {
    include.push({
      model: db.VenueCategory,
      as: 'categories',
      through: { attributes: [] },
      where: { id: { [Op.in]: filters.category_ids } }
    });
  }
  if (filters.budget_range_ids.length) {
    include.push({
      model: db.VenueBudgetRange,
      as: 'budgetRanges',
      through: { attributes: [] },
      where: { id: { [Op.in]: filters.budget_range_ids } }
    });
  }
  if (filters.experience_type_ids.length) {
    include.push({
      model: db.VenueExperienceType,
      as: 'experienceTypes',
      through: { attributes: [] },
      where: { id: { [Op.in]: filters.experience_type_ids } }
    });
  }
  if (filters.party_type_ids.length) {
    include.push({
      model: db.VenuePartType,
      as: 'partyTypes',
      through: { attributes: [] },
      where: { id: { [Op.in]: filters.party_type_ids } }
    });
  }
  if (filters.suitable_time_ids.length) {
    include.push({
      model: db.VenueSuitableTime,
      as: 'suitableTimes',
      through: { attributes: [] },
      where: { id: { [Op.in]: filters.suitable_time_ids } }
    });
  }
  if (filters.looking_for_ids.length) {
    include.push({
      model: db.VenueExperienceLookingFor,
      as: 'lookingFor',
      through: { attributes: [] },
      where: { id: { [Op.in]: filters.looking_for_ids } }
    });
  }
  if (filters.location_ids.length) {
    include.push({
      model: db.Location,
      as: 'locations',
      through: { attributes: [] },
      where: { id: { [Op.in]: filters.location_ids } }
    });
  }

  return { where, include };
}

// Helper: get mapping model for a given options_source
function getMappingModel(source) {
  const map = {
    categories: db.VenueFinderQuizCategoryMapping,
    budget_ranges: db.VenueFinderQuizBudgetRangeMapping,
    experience_types: db.VenueFinderQuizExperienceTypeMapping,
    party_types: db.VenueFinderQuizPartyTypeMapping,
    suitable_times: db.VenueFinderQuizSuitableTimeMapping,
    looking_for: db.VenueFinderQuizLookingForMapping,
    locations: db.VenueFinderQuizLocationMapping,
  };
  return map[source];
}

// Helper: get reference model for a given options_source
function getRefModel(source) {
  const map = {
    categories: db.VenueCategory,
    budget_ranges: db.VenueBudgetRange,
    experience_types: db.VenueExperienceType,
    party_types: db.VenuePartType,
    suitable_times: db.VenueSuitableTime,
    looking_for: db.VenueExperienceLookingFor,
    locations: db.Location,
  };
  return map[source];
}

// Helper: get foreign key name for a given options_source
function getFkName(source) {
  const map = {
    categories: 'category_id',
    budget_ranges: 'budget_range_id',
    experience_types: 'experience_type_id',
    party_types: 'party_type_id',
    suitable_times: 'suitable_time_id',
    looking_for: 'looking_for_id',
    locations: 'location_id',
  };
  return map[source];
}

// Helper: get filter data key for a given options_source (used when building filter_data for public quiz)
function getFilterDataKey(source) {
  const map = {
    categories: 'category_ids',
    budget_ranges: 'budget_range_ids',
    experience_types: 'experience_type_ids',
    party_types: 'party_type_ids',
    suitable_times: 'suitable_time_ids',
    looking_for: 'looking_for_ids',
    locations: 'location_ids',
  };
  return map[source];
}

// ------------------- Admin CRUD -------------------

// List all quizzes with filters and pagination
exports.listQuizzes = async (req, res) => {
  try {
    const { search, blog_id, status, sort, page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) where.title = { [Op.like]: `%${search}%` };
    if (blog_id) where.birthday_blog_id = blog_id;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    let order = [];
    switch (sort) {
      case 'latest': order = [['createdAt', 'DESC']]; break;
      case 'oldest': order = [['createdAt', 'ASC']]; break;
      case 'title_asc': order = [['title', 'ASC']]; break;
      case 'title_desc': order = [['title', 'DESC']]; break;
      default: order = [['createdAt', 'DESC']];
    }

    const { count, rows: quizzes } = await db.VenueFinderQuiz.findAndCountAll({
      where,
      include: [
        { model: db.BirthdayBlog, as: 'birthdayBlog' },
        { model: db.VenueFinderQuizQuestion, as: 'questions', required: false }
      ],
      order,
      limit,
      offset,
      distinct: true
    });

    const stats = {
      activeCount: await db.VenueFinderQuiz.count({ where: { isActive: true } }),
      linkedBlogs: await db.VenueFinderQuiz.count({ where: { birthday_blog_id: { [Op.ne]: null } } }),
      totalQuestions: await db.VenueFinderQuizQuestion.count()
    };

    const blogs = await db.BirthdayBlog.findAll({ where: { isActive: true }, order: [['title', 'ASC']] });

    const pagination = {
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalCount: count,
      limit
    };

    res.render('admin/venues/finder/index', {
      quizzes,
      stats,
      blogs,
      filters: { search: search || '', blog_id: blog_id || '', status: status || '', sort: sort || 'latest' },
      pagination
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Show form to create new quiz
exports.createQuizForm = async (req, res) => {
  try {
    const blogs = await db.BirthdayBlog.findAll({ where: { isActive: true } });
    res.render('admin/venues/finder/create', { blogs });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Store new quiz
exports.storeQuiz = async (req, res) => {
  try {
    let { title, birthday_blog_id } = req.body;
    if (birthday_blog_id === '') birthday_blog_id = null;
    const slug = slugify(title, { lower: true, strict: true });
    const quiz = await db.VenueFinderQuiz.create({ title, slug, birthday_blog_id });
    res.redirect(`/admin/quizzes/${quiz.id}/questions`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Show edit quiz form
exports.editQuizForm = async (req, res) => {
  try {
    const quiz = await db.VenueFinderQuiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).send('Not found');
    const blogs = await db.BirthdayBlog.findAll({ where: { isActive: true } });
    res.render('admin/venues/finder/edit', { quiz, blogs });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    let { title, birthday_blog_id } = req.body;
    if (birthday_blog_id === '') birthday_blog_id = null;
    const quiz = await db.VenueFinderQuiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).send('Not found');
    const slug = slugify(title, { lower: true, strict: true });
    await quiz.update({ title, slug, birthday_blog_id });
    res.redirect('/admin/quizzes');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await db.VenueFinderQuiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).send('Not found');
    await quiz.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle quiz active status (AJAX)
exports.toggleQuizStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const quiz = await db.VenueFinderQuiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    await quiz.update({ isActive });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ------------------- Questions Management -------------------

// Show questions for a quiz
exports.listQuestions = async (req, res) => {
  try {
    const quiz = await db.VenueFinderQuiz.findByPk(req.params.quizId);
    if (!quiz) return res.status(404).send('Quiz not found');

    const questions = await db.VenueFinderQuizQuestion.findAll({
      where: { quiz_id: quiz.id },
      include: [{ model: db.VenueFinderQuizOption, as: 'options' }],
      order: [['order', 'ASC']]
    });

    // For each question, load its reference options (if any)
    for (let q of questions) {
      if (q.options_source !== 'custom') {
        const refModel = getRefModel(q.options_source);
        const mappingModel = getMappingModel(q.options_source);
        const fk = getFkName(q.options_source);
        if (refModel && mappingModel) {
          q.referenceOptions = await refModel.findAll({
            include: [{
              model: mappingModel,
              where: { question_id: q.id },
              required: true
            }]
          });
        }
      }
    }

    res.render('admin/venues/finder/questions', { quiz, questions });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Show form to create a new question
exports.createQuestionForm = async (req, res) => {
  try {
    const quiz = await db.VenueFinderQuiz.findByPk(req.params.quizId);
    if (!quiz) return res.status(404).send('Quiz not found');

    // Load all reference data for dropdowns (admin can select which options to include)
    const referenceData = {
      categories: await db.VenueCategory.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      budget_ranges: await db.VenueBudgetRange.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      experience_types: await db.VenueExperienceType.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      party_types: await db.VenuePartType.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      suitable_times: await db.VenueSuitableTime.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      looking_for: await db.VenueExperienceLookingFor.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      locations: await db.Location.findAll({ where: { isActive: true }, order: [['title', 'ASC']] })
    };

    res.render('admin/venues/finder/create_question', { quiz, referenceData });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Store new question
exports.storeQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { text, order, type, options_source, config, filter_mapping, selected_options = [] } = req.body;

    // Create question
    const question = await db.VenueFinderQuizQuestion.create({
      quiz_id: quizId,
      text,
      order: order || 0,
      type,
      options_source,
      config: config ? JSON.parse(config) : null,
      filter_mapping: filter_mapping ? JSON.parse(filter_mapping) : null
    });

    // If reference options, create mappings
    if (options_source !== 'custom') {
      const mappingModel = getMappingModel(options_source);
      const fk = getFkName(options_source);
      if (mappingModel && selected_options.length) {
        const mappings = selected_options.map(id => ({ question_id: question.id, [fk]: id }));
        await mappingModel.bulkCreate(mappings, { ignoreDuplicates: true });
      }
    }

    // Redirect based on question type
    if (options_source === 'custom' && ['radio', 'checkbox', 'select'].includes(type)) {
      res.redirect(`/admin/quizzes/${quizId}/questions/${question.id}/options`);
    } else {
      res.redirect(`/admin/quizzes/${quizId}/questions`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Show edit question form
exports.editQuestionForm = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const question = await db.VenueFinderQuizQuestion.findByPk(questionId);
    if (!question || question.quiz_id != quizId) return res.status(404).send('Not found');
    const quiz = await db.VenueFinderQuiz.findByPk(quizId);

    // Load selected reference IDs if any
    let selectedIds = [];
    if (question.options_source !== 'custom') {
      const mappingModel = getMappingModel(question.options_source);
      const fk = getFkName(question.options_source);
      if (mappingModel) {
        const mappings = await mappingModel.findAll({ where: { question_id: question.id } });
        selectedIds = mappings.map(m => m[fk]);
      }
    }

    // Load all reference data for dropdowns
    const referenceData = {
      categories: await db.VenueCategory.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      budget_ranges: await db.VenueBudgetRange.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      experience_types: await db.VenueExperienceType.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      party_types: await db.VenuePartType.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      suitable_times: await db.VenueSuitableTime.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      looking_for: await db.VenueExperienceLookingFor.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      locations: await db.Location.findAll({ where: { isActive: true }, order: [['title', 'ASC']] })
    };

    res.render('admin/venues/finder/edit_question', { quiz, question, selectedIds, referenceData });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const { text, order, type, options_source, config, filter_mapping, selected_options = [] } = req.body;

    const question = await db.VenueFinderQuizQuestion.findByPk(questionId);
    if (!question || question.quiz_id != quizId) return res.status(404).send('Not found');

    await question.update({
      text,
      order: order || 0,
      type,
      options_source,
      config: config ? JSON.parse(config) : null,
      filter_mapping: filter_mapping ? JSON.parse(filter_mapping) : null
    });

    // Sync reference mappings
    if (options_source !== 'custom') {
      const mappingModel = getMappingModel(options_source);
      const fk = getFkName(options_source);
      if (mappingModel) {
        // Remove existing
        await mappingModel.destroy({ where: { question_id: question.id } });
        // Add new
        if (selected_options.length) {
          const mappings = selected_options.map(id => ({ question_id: question.id, [fk]: id }));
          await mappingModel.bulkCreate(mappings);
        }
      }
    }

    res.redirect(`/admin/quizzes/${quizId}/questions`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const question = await db.VenueFinderQuizQuestion.findByPk(questionId);
    if (!question || question.quiz_id != quizId) return res.status(404).send('Not found');
    await question.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------- Options Management (Custom only) -------------------

// List options for a custom question
exports.listOptions = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const question = await db.VenueFinderQuizQuestion.findByPk(questionId);
    if (!question || question.quiz_id != quizId) return res.status(404).send('Not found');
    const options = await db.VenueFinderQuizOption.findAll({
      where: { question_id: questionId },
      order: [['order', 'ASC']]
    });
    res.render('admin/venues/finder/options', { quizId, question, options });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Show form to create a new custom option
exports.createOptionForm = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const question = await db.VenueFinderQuizQuestion.findByPk(questionId);
    if (!question || question.quiz_id != quizId) return res.status(404).send('Not found');
    res.render('admin/venues/finder/create_option', { quizId, question });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Store new custom option
exports.storeOption = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const { text, order, filter_data } = req.body;
    await db.VenueFinderQuizOption.create({
      question_id: questionId,
      text,
      order: order || 0,
      filter_data: filter_data ? JSON.parse(filter_data) : null
    });
    res.redirect(`/admin/quizzes/${quizId}/questions/${questionId}/options`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Show edit option form
exports.editOptionForm = async (req, res) => {
  try {
    const { quizId, questionId, optionId } = req.params;
    const option = await db.VenueFinderQuizOption.findByPk(optionId);
    if (!option || option.question_id != questionId) return res.status(404).send('Not found');
    const question = await db.VenueFinderQuizQuestion.findByPk(questionId);
    res.render('admin/venues/finder/edit_option', { quizId, question, option });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Update custom option
exports.updateOption = async (req, res) => {
  try {
    const { quizId, questionId, optionId } = req.params;
    const { text, order, filter_data } = req.body;
    const option = await db.VenueFinderQuizOption.findByPk(optionId);
    if (!option || option.question_id != questionId) return res.status(404).send('Not found');
    await option.update({
      text,
      order: order || 0,
      filter_data: filter_data ? JSON.parse(filter_data) : null
    });
    res.redirect(`/admin/quizzes/${quizId}/questions/${questionId}/options`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Delete custom option
exports.deleteOption = async (req, res) => {
  try {
    const { quizId, questionId, optionId } = req.params;
    const option = await db.VenueFinderQuizOption.findByPk(optionId);
    if (!option || option.question_id != questionId) return res.status(404).send('Not found');
    await option.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------- Public Quiz -------------------

// Show quiz with questions
exports.showQuiz = async (req, res) => {
  try {
    const quiz = await db.VenueFinderQuiz.findOne({
      where: { slug: req.params.slug, isActive: true },
      include: [{ model: db.VenueFinderQuizQuestion, as: 'questions', where: { isActive: true }, required: false, order: [['order', 'ASC']] }]
    });
    if (!quiz) return res.status(404).send('Quiz not found');

    const questionsWithOptions = [];
    for (const question of quiz.questions) {
      let options = [];
      if (question.options_source === 'custom' && ['radio', 'checkbox', 'select'].includes(question.type)) {
        options = await db.VenueFinderQuizOption.findAll({
          where: { question_id: question.id, isActive: true },
          order: [['order', 'ASC']]
        });
      } else if (question.options_source !== 'custom') {
        const refModel = getRefModel(question.options_source);
        const mappingModel = getMappingModel(question.options_source);
        const fk = getFkName(question.options_source);
        if (refModel && mappingModel) {
          const records = await refModel.findAll({
            include: [{ model: mappingModel, where: { question_id: question.id }, required: true }],
            order: [['name', 'ASC']]
          });
          options = records.map(rec => ({
            id: rec.id,
            text: rec.name || rec.title,
            filter_data: { [getFilterDataKey(question.options_source)]: [rec.id] }
          }));
        }
      }
      questionsWithOptions.push({ ...question.toJSON(), options });
    }

    res.render('quiz/show', { quiz, questions: questionsWithOptions });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Submit quiz answers and filter venues
exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await db.VenueFinderQuiz.findOne({
      where: { slug: req.params.slug, isActive: true },
      include: [{ model: db.VenueFinderQuizQuestion, as: 'questions', where: { isActive: true }, required: false, order: [['order', 'ASC']] }]
    });
    if (!quiz) return res.status(404).send('Quiz not found');

    const answers = req.body; // e.g., { "question_1": "option_id", "question_2": ["id1","id2"], "question_3_range": { min, max }, "question_4_date": "2025-06-15" }
    const selectedOptions = [];

    for (const question of quiz.questions) {
      const inputKey = `question_${question.id}`;
      const answer = answers[inputKey];

      if (question.type === 'range') {
        if (answer && typeof answer === 'object') {
          const { min, max } = answer;
          const filterMapping = question.filter_mapping || {};
          for (const [field, mapping] of Object.entries(filterMapping)) {
            let condition = {};
            if (mapping.min && mapping.min.includes('{{min}}')) condition[Op.gte] = min;
            if (mapping.max && mapping.max.includes('{{max}}')) condition[Op.lte] = max;
            selectedOptions.push({ filter_data: { [field]: condition } });
          }
        }
      } else if (question.type === 'date') {
        // Handle date - can map to suitable_times etc.
        if (answer) {
          // For simplicity, you might map to a suitable_time_id based on day of week, etc.
        }
      } else {
        // Radio, checkbox, select
        let optionIds = Array.isArray(answer) ? answer : (answer ? [answer] : []);
        for (const optId of optionIds) {
          if (question.options_source === 'custom') {
            const opt = await db.VenueFinderQuizOption.findByPk(optId);
            if (opt && opt.filter_data) selectedOptions.push(opt);
          } else {
            // For reference table options, we need to get the filter_data from the referenced record
            const refModel = getRefModel(question.options_source);
            const record = await refModel.findByPk(optId);
            if (record) {
              selectedOptions.push({ filter_data: { [getFilterDataKey(question.options_source)]: [record.id] } });
            }
          }
        }
      }
    }

    const { include, where } = await buildVenueFilters(selectedOptions);
    const venues = await db.Venue.findAll({
      where: { isActive: true },
      include,
      distinct: true
    });

    res.render('quiz/results', { quiz, venues });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};