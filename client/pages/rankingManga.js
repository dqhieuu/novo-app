import { useState } from 'react';
import { useContext } from 'react';
import { MangaContext } from '../Context/MangaContext';
import DisplayImg from '../components/displayImg';
import NULL_CONSTANTS from '../utilities/nullConstants';
import ByWeek from '../components/rankingManga/byWeek';
import ByMonth from '../components/rankingManga/byMonth';
import ByYear from '../components/rankingManga/byYear';
export default function RankingManga() {
  return (
    <div>
      <div className="container">
        <h5
          className="mt-3 ps-3"
          style={{
            color: 'green',
            borderLeft: '5px solid green',
          }}
        >
          ĐỌC NHIỀU NHẤT
        </h5>
        <ul
          className="nav nav-tabs nav-justified"
          id="myTab"
          role="tablist"
        >
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="week-tab"
              data-bs-toggle="tab"
              data-bs-target="#week"
              type="button"
              role="tab"
              aria-controls="week"
              aria-selected="true"
            >
              Tuần
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="month-tab"
              data-bs-toggle="tab"
              data-bs-target="#month"
              type="button"
              role="tab"
              aria-controls="month"
              aria-selected="false"
            >
              Tháng
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="year-tab"
              data-bs-toggle="tab"
              data-bs-target="#year"
              type="button"
              role="tab"
              aria-controls="year"
              aria-selected="true"
            >
              Năm
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="allRank-tab"
              data-bs-toggle="tab"
              data-bs-target="#allRank"
              type="button"
              role="tab"
              aria-controls="allRank"
              aria-selected="false"
            >
              Tất cả
            </button>
          </li>
        </ul>
        <div className="tab-content mt-5">
          <div
            className="tab-pane active"
            id="week"
            role="tabpanel"
            aria-labelledby="week-tab"
          >
            <ByWeek></ByWeek>
          </div>
          <div
            className="tab-pane "
            id="month"
            role="tabpanel"
            aria-labelledby="month-tab"
          >
            <ByMonth></ByMonth>
          </div>
          <div
            className="tab-pane "
            id="year"
            role="tabpanel"
            aria-labelledby="year-tab"
          >
            <ByYear></ByYear>
          </div>
          <div
            className="tab-pane "
            id="allRank"
            role="tabpanel"
            aria-labelledby="allRank-tab"
          >
            <ByYear></ByYear>
          </div>
        </div>
      </div>
    </div>
  );
}
