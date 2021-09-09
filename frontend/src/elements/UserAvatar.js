
export default function get_avatar(params) {

  try {
    const path = publicRuntimeConfig.BACKEND_URL + "/uploads/" + params.split("/uploads/")[1];
    const val  = fetch(path)
      .then(function (response) {
        return response.blob();
      })
      .then(function (res) {
        let imgObjectURL = URL.createObjectURL(res);
        if (imgObjectURL) {
            return imgObjectURL;
        }
      });
  } catch (error) {
      return ""
  }
}
