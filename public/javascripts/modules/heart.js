import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e){
  e.preventDefault();
  console.log(this);
  console.log(this.action);
  axios
    .post(this.action)
    .then(res => {
      // toggle heart class
      const isHearted = this.heart.classList.toggle('heart__button--hearted');
      // count hearts in nav
      $('.heart-count').textContent = res.data.hearts.length;
    })
    .catch(error => {
      console.error(error);
    });
}

export default ajaxHeart;