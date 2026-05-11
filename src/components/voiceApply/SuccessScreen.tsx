import jobDetailBgPng from '../../assets/job-detail-bg.png';
import { HomeIndicator } from './PhoneShell';

const RECOMMENDED_JOBS = [
  {
    title: '纸箱厂300一天周结',
    salary: '8000-10000元/月',
    meta: '夫妻房 | 长白班 | 三餐免费 | 五险一金 | 坐班',
    company: '芜湖市光明纸箱包装有限公司',
    location: '芜湖·南陵县',
    applied: '999+人已报名',
  },
  {
    title: '快递小件装卸工',
    salary: '8800-9300元/月',
    meta: '可预支工资 | 住宿免费 | 五险 | 白班和夜班',
    company: '北京通泰达物流有限公司',
    location: '北京·房山',
    applied: '老乡已报名',
  },
  {
    title: '搬运工',
    salary: '7000-14000元/月',
    meta: '日结 | 2人间宿舍 | 低价工作餐 | 意外险',
    company: '天津市天勤企业管理有限公司',
    location: '平谷 18km',
    applied: '老乡已报名',
  },
];

export function SuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 overflow-hidden">
      <img alt="" className="absolute inset-0 h-full w-full" src={jobDetailBgPng} />

      <div className="absolute inset-x-0 bottom-0 top-[18%] overflow-hidden rounded-t-[20px] bg-white">
        <button
          className="absolute right-[18px] top-[18px] z-10 h-[32px] w-[32px] text-[28px] leading-[28px] text-[#222222]"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex flex-col items-center px-[24px] pt-[22px]">
            <div className="flex items-center gap-[8px]">
              <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#2fd8a3] text-[15px] font-medium leading-[15px] text-white">
                ✓
              </div>
              <h1 className="m-0 text-[30px] font-medium leading-[42px] text-[#222222]">报名成功</h1>
            </div>
            <p className="m-0 mt-[8px] text-[16px] leading-[22px] text-[#777777]">
              请留意私信消息或手机来电
            </p>

            <div className="mt-[24px] flex gap-[12px]">
              <button
                className="h-[40px] w-[128px] rounded-[20px] border border-[#e4e4e4] bg-white text-[15px] font-medium leading-[21px] text-[#222222]"
                type="button"
              >
                更新简历
              </button>
              <button
                className="h-[40px] w-[128px] rounded-[20px] border border-[#e4e4e4] bg-white text-[15px] font-medium leading-[21px] text-[#222222]"
                type="button"
              >
                报名记录
              </button>
            </div>
          </div>

          <div className="mt-[34px] min-h-0 flex-1 overflow-y-auto px-[20px] pb-[22px]">
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[18px] font-medium leading-[25px] text-[#222222]">相似职位推荐</h2>
              <button className="text-[15px] leading-[21px] text-[#777777]" type="button">
                更多职位
              </button>
            </div>

            <div className="mt-[18px] space-y-[18px]">
              {RECOMMENDED_JOBS.map((job) => (
                <div className="border-b border-[#f2f2f2] pb-[18px]" key={job.title}>
                  <div className="flex items-start justify-between gap-[12px]">
                    <div className="min-w-0 flex-1">
                      <h3 className="m-0 text-[18px] font-medium leading-[25px] text-[#222222]">{job.title}</h3>
                      <p className="m-0 mt-[6px] text-[16px] font-medium leading-[22px] text-[#ff3b66]">{job.salary}</p>
                      <p className="m-0 mt-[4px] text-[14px] leading-[20px] text-[#777777]">{job.meta}</p>
                      <p className="m-0 mt-[8px] text-[14px] leading-[20px] text-[#b0b0b0]">{job.company}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end">
                      <p className="m-0 text-[14px] leading-[20px] text-[#777777]">{job.location}</p>
                      <p className="m-0 mt-[58px] text-[14px] leading-[20px] text-[#ff6d8f]">{job.applied}</p>
                      <button
                        className="mt-[8px] h-[36px] w-[74px] rounded-[18px] bg-[#ff3b66] text-[15px] font-medium leading-[21px] text-white"
                        type="button"
                      >
                        报名
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pb-[8px]">
            <HomeIndicator className="mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
