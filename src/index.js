import $ from "jquery";
import "./css/style.css";
// import "./css/lightbox.min.css";
// import "./lightbox-plus-jquery.min.js";

let photosets_array = [];
let objects_array = [];
let buttons = [];
let objects_array_2 = [];

let preogressbar = $(".preogressbar");
let percent = $(".percent");

window.onscroll = function () {
  let totalHeight = document.body.scrollHeight - window.innerHeight;
  let progress = (window.pageYOffset / totalHeight) * 100;
  preogressbar.css("height", progress + "%");
  percent.text("Page Scrolled " + Math.round(progress) + "%");
};

$(window).ready(() => {
  loadPhotosets()
    .then((list) => {
      for (let i in list.photosets.photoset) {
        photosets_array.push(
          new Promise((resolve, reject) => {
            $.ajax({
              url: "https://www.flickr.com/services/rest",
              data: {
                method: "flickr.photosets.getPhotos",
                api_key: "f6146b5aea320305af01030c6fc04c59",
                user_id: "48600090482@N01",
                photoset_id: list.photosets.photoset[i].id,
                nojsoncallback: 1,
                format: "json",
              },
            })
              .then((photoset) => {
                resolve(photoset);
              })
              .fail((error) => {
                console.log(error);
                reject(error);
              });
          })
        );
      }
      Promise.all(photosets_array).then((photoset) => {
        makeForm(photoset, list);
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

const makeForm = (photosets, list) => {
  for (let i in photosets) {
    objects_array.push({
      count: photosets[i].photoset.photo.length,
      photoset_title: photosets[i].photoset.title,
      photo_array: photosets[i].photoset.photo,
      description: list.photosets.photoset[i].description._content,
    });
  }
  setOnClickListener(objects_array);
};

const show = (j) => {
  $(".photoset-container").empty();
  // console.log(j);
  for (let i = (j - 1) * 10; i < j * 10; i += 1) {
    $(".photoset-container").append(
      `<div class="photoset" id="photoset_${i}">
       <div class="photoset__title">${objects_array[i].photoset_title}</div>
       <div class="photoset__count">${objects_array[i].count}</div>
       <div class="photoset__description">${objects_array[i].description}</div>
       <div class="photoset__set"></div>
     </div>
    `
    );
    $(`#photoset_${i}`).click(() => {
      if ($(`#photoset_${i}`).find(".photoset__set").is(":empty")) {
        for (let k in objects_array[i].photo_array) {
          $(`#photoset_${i}`)
            .find(".photoset__set")
            .append(getPhotoHTML(objects_array[i].photo_array[k]));
        }
      } else {
        $(`#photoset_${i}`).find(".photoset__set").empty();
      }
      // $.getScript("../src/lightbox-plus-jquery.min.js");
      $(".photoset__photo-wrapper").click(() => {
        const sliderHTML = `
    <div class="slider">
    <div class="swiper-container gallery-top">
      <div class="swiper-wrapper">
        
      </div>
      <!-- Add Arrows -->
      <div class="swiper-button-next swiper-button-white"></div>
      <div class="swiper-button-prev swiper-button-white"></div>
    </div>
    <div class="swiper-container gallery-thumbs">
      <div class="swiper-wrapper">
        
      </div>
    </div>
    `;

        $(".slider-wrapper").append(sliderHTML).show();

        let galleryThumbs = new Swiper(".gallery-thumbs", {
          spaceBetween: 10,
          slidesPerView: 5,
          freeMode: true,
          watchSlidesVisibility: true,
          watchSlidesProgress: false,
        });
        let galleryTop = new Swiper(".gallery-top", {
          spaceBetween: 0,
          lazy: true,
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
          thumbs: {
            swiper: galleryThumbs,
          },
        });

        for (let o in objects_array[i].photo_array) {
          galleryThumbs.appendSlide(`
              <div class="swiper-slide slider__img-wrapper">
                <img class="slider__img" src="
                  https://farm${objects_array[i].photo_array[o].farm}.staticflickr.com/${objects_array[i].photo_array[o].server}/${objects_array[i].photo_array[o].id}_${objects_array[i].photo_array[o].secret}.jpg
                " alt="">
              </div>
            `);
          galleryTop.appendSlide(`
              <div class="swiper-slide slider__img-wrapper slider__img-wrapper_top">
                <img class="slider__img slider__img_top" src="
                  https://farm${objects_array[i].photo_array[o].farm}.staticflickr.com/${objects_array[i].photo_array[o].server}/${objects_array[i].photo_array[o].id}_${objects_array[i].photo_array[o].secret}.jpg
                " alt="">
              </div>
            `);
        }
      });
    });
  }
};

const getPhotoHTML = (photo) => {
  return `
    <div class="photoset__photo-wrapper">
      <img src="https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg" alt="" class="photoset__photo">
    </div>
  `;
};

const setOnClickListener = () => {
  $(".pages__page").each(function () {
    buttons.push($(this));
  });

  for (let i = 0; i < 11; i += 1) {
    buttons[i].click(() => {
      $(".pages__page-active").addClass("pages__page");
      $(".pages__page-active").removeClass("pages__page-active");
      buttons[i].addClass("pages__page-active");
      buttons[i].removeClass("pages__page");
      show(i + 1);
    });
  }
  buttons[0].click();
};

$("#name").click(() => {
  if (objects_array_2[0] === undefined) {
    for (let i in objects_array) {
      objects_array_2[i] = objects_array[i];
    }
  }
  sort_by_name();
  show(1);
});

$("#default").click(() => {
  if (objects_array_2[0] !== undefined) {
    for (let i in objects_array_2) {
      objects_array[i] = objects_array_2[i];
    }
  }
  show(1);
});

const sort_by_name = () => {
  objects_array.sort((a, b) =>
    a.photoset_title.toLowerCase() > b.photoset_title.toLowerCase() ? 1 : -1
  );
};

$("#by_input").keyup(() => {
  // console.log($(".menu__input").val());
  let value = $(".menu__input").val();

  if (objects_array_2[0] === undefined) {
    for (let i in objects_array) {
      objects_array_2[i] = objects_array[i];
    }
  }
  objects_array.sort((current, next) => {
    if (
      current.photoset_title.toLowerCase().indexOf(value.toLowerCase()) >
      next.photoset_title.toLowerCase().indexOf(value.toLowerCase())
    )
      return -1;
    if (
      current.photoset_title.toLowerCase().indexOf(value.toLowerCase()) <
      next.photoset_title.toLowerCase().indexOf(value.toLowerCase())
    )
      return 1;
    return 0;
  });

  show(1);
});

const loadPhotosets = () => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "https://www.flickr.com/services/rest",
      data: {
        method: "flickr.photosets.getList",
        api_key: "f6146b5aea320305af01030c6fc04c59",
        user_id: "48600090482@N01",
        nojsoncallback: 1,
        format: "json",
      },
    })
      .done((photosets) => {
        console.log(photosets);
        resolve(photosets);
      })
      .fail((error) => {
        reject(new Error(`Cant connect to Flickr\'s API ${error}`));
      });
  });
};
