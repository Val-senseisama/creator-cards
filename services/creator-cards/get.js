const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { CreatorCardMessages } = require('@app/messages');
const CreatorCard = require('@app/repository/creator-card');
const serializeCard = require('./serialize');

const spec = `root {
  slug string
  access_code? string
}`;

const parsedSpec = validator.parse(spec);

async function getCreatorCard(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);

  const card = await CreatorCard.findOne({ query: { slug: data.slug } });
  if (!card) {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF01');
  }

  if (card.status === 'draft') {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF02');
  }

  if (card.access_type === 'private') {
    if (!data.access_code) {
      throwAppError(CreatorCardMessages.CARD_IS_PRIVATE, 'AC03');
    }
    if (data.access_code !== card.access_code) {
      throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, 'AC04');
    }
  }

  return serializeCard(card, { includeAccessCode: false });
}

module.exports = getCreatorCard;
