const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { CreatorCardMessages } = require('@app/messages');
const CreatorCard = require('@app/repository/creator-card');
const serializeCard = require('./serialize');

const spec = `root {
  slug string
  creator_reference string<length:20>
}`;

const parsedSpec = validator.parse(spec);

async function deleteCreatorCard(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);

  const card = await CreatorCard.findOne({ query: { slug: data.slug } });
  if (!card) {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF01');
  }

  const now = Date.now();

  await CreatorCard.updateOne({
    query: { _id: card._id },
    updateValues: { deleted: now, updated: now, slug: `&del:${now}-${card.slug}` },
  });

  return serializeCard({ ...card, deleted: now, updated: now }, { includeAccessCode: true });
}

module.exports = deleteCreatorCard;
