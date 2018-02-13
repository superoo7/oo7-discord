import {
  maximumPostAge,
  minimumLength,
  optimumLength
} from './config.json';
import moment from 'moment';

function checkPostAge(isoDate) {
  const unixDate = new Date(
    isoDate
      .replace(/-/g, '/')
      .replace('T', ' ')
      .replace('Z', '')
  );
  return Date.now() - unixDate > maximumPostAge;
}

function weightageForPost(postLength) {
  if (postLength < minimumLength) {
    // 10% VP
    return 10 * 100;
  } else if (postLength < optimumLength) {
    // 10% ~ 80% VP
    return parseInt(
      (postLength - minimumLength) /
        (optimumLength - minimumLength) *
        80 *
        100
    );
  } else {
    // 80% VP
    return 80 * 100;
  }
}

function beautifyDate(isoDate) {
  const unixDate = new Date(
    isoDate
      .replace(/-/g, '/')
      .replace('T', ' ')
      .replace('Z', '')
  );
  return moment(unixDate).fromNow();
}

export { checkPostAge, weightageForPost, beautifyDate };
