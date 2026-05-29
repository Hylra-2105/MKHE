export const createVietnameseRegex = (keyword) => {
  if (!keyword) return "";
  let str = keyword.toLowerCase();

  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");

  str = str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

  str = str.replace(/a/g, "[aàáạảãâầấậẩẫăằắặẳẵ]");
  str = str.replace(/e/g, "[eèéẹẻẽêềếệểễ]");
  str = str.replace(/i/g, "[iìíịỉĩ]");
  str = str.replace(/o/g, "[oòóọỏõôồốộổỗơờớợởỡ]");
  str = str.replace(/u/g, "[uùúụủũưừứựửữ]");
  str = str.replace(/y/g, "[yỳýỵỷỹ]");
  str = str.replace(/d/g, "[dđ]");

  return str;
};