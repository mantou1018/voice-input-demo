export interface MockScenario {
  id: string;
  title: string;
  subtitle: string;
  transcript: string;
}

export const mockScenarios: MockScenario[] = [
  {
    id: 'meeting-sync',
    title: '会议同步',
    subtitle: '较长语音',
    transcript:
      '今天和客户开了产品方案会，确认第一阶段先上线语音转文字和信息卡片。下周二之前我要把交互稿过一遍，设计那边要补动画细节，技术这边需要评估浏览器语音识别兼容性，并且准备一个可以直接演示的移动端页面。',
  },
  {
    id: 'todo-reminder',
    title: '待办提醒',
    subtitle: '短语音',
    transcript:
      '明天下午三点记得去医院拿体检报告，然后顺路去超市买牛奶和面包，晚上回家前联系一下物业确认快递柜的事情。',
  },
  {
    id: 'brain-dump',
    title: '随口记录',
    subtitle: '语义松散',
    transcript:
      '刚刚想到首页视觉不能太平，背景最好有一点流动感。录音按钮按下去要有呼吸灯，转写出来的时候别一股脑全堆上去，可以分段渐显。还有卡片不要像普通备忘录，信息层级得更明显一点。',
  },
];
