import chalk from 'chalk';
import readlineSync from 'readline-sync';

/** 
 * [0, max - 1) 의 정수를 무작위로 생성하는 함수
*/
function rand(max) {
  return Math.floor(Math.random() * max);
}

function printAndLog(message, logs) {
  console.log(message);
  logs.push(message);
}


class Player {
  constructor(stage) {
    // 기초 스탯 (승리보상 및 장비로만 상승 가능)
    this.hp = 100; // 체력
    this.strength = 10; // 공격력
    this.defense = 1; // 방어력 (적 공격력에서 수치만큼 차감)

    // 특수 스탯 (전투로 성장 가능)
    this.accuracy = 70; // 명중률 (0 ~ 100)
    this.block = 30; // 블록률 (0 ~ 100) >> `방어하기`를 선택했을 때만 발동
    this.counter = 30; // 반격률 (0 ~ 100) >> 수비 페이즈에만 발동

    // 연속공격 스탯 (전투로 성장 가능)
    this.crit_rate = 30; // 연속공격 확률 (0 ~ 100) >> 연속공격은 적의 블록과 반격을 무시한다.
    this.crit_strike = 2; // 연속공격시 공격횟수
    this.counter_crit = false // 연속공격은 기본적으로 선공에만 발동하지만
                              // 특정 장비를 장착하면 반격시 발동이 가능해진다.
    this.crit_string = 'DOUBLE ATTACK';

    // 방어 태세
    this.defense_mode = false; // `방어하기` 선택시 1턴간 활성화 : 데미지 50% 경감 및 블록 활성화

    // 도주 스탯
    this.escape_rate = 50; // 도주 성공률 >> 성공시 스테이지 클리어 판정이지만 전투보상을 얻지 못한다.
    this.escaped = false // 최근 스테이지 도주 여부

    // 성장 보너스
    this.accuracy_growth = 1; // 명중률 : 선공으로 적에게 데미지를 가하면 성공
    this.block_growth = 2; // 블록률 : 블록 성공 시 성장
    this.counter_growth = 2; // 반격률 : 반격 성공 시 성장
    this.crate_growth = 2; // 치명타 확률 : 치명타로 적에게 데미지를 가하면 성장

    // 스테이지 클리어 보너스
    this.strength_bonus_range = [2, 2, 2, 2, 2, 2, 2,           // 35%   // 공격력 보너스 범위
                                 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,  // 50%
                                 4, 4,                          // 10%
                                 5,                             // 5%
    ];
    this.defense_bonus_range = [1, 1,                           // 20%   // 방어력 보너스 범위
                                2, 2, 2, 2, 2, 2,               // 60%
                                3, 3,                           // 20%
    ];
    this.recovery = 5 + ( 2 * stage ) ; // HP 회복 보너스
  }

  // 공격하기
  attack(mob, logs) {
    // 방어모드 해제
    this.defense_mode = false;

    const hit = rand(100) < this.accuracy; // 명중 판정
    const player_crit = rand(100) < this.crit_rate // 플레이어 연속공격 판정

    const mob_blocked = rand(100) < mob.block; // 몬스터 블록 판정
    const mob_countered = rand(100) < mob.counter; // 몬스터 반격 판정
    const counter_hit = rand(100) < mob.accuracy; // 몬스터 반격 명중 판정
    const counter_crit = rand(100) < Number(mob.counter_crit && mob.crit_rate); // 몬스터 반격 연속공격 판정

    // 플레이어 데미지
    let player_dmg = Math.max( this.strength - mob.defense, 0 ); // 적 방어력 차감
    player_dmg = (player_crit) ? player_dmg * this.crit_strike : player_dmg // 연속공격 적용
    player_dmg = Math.floor(player_dmg); // 최종데미지에서 소숫점 아래 버림
    // 몬스터 반격 데미지
    let mob_dmg = Math.max( mob.strength - this.defense, 0 ); // 플레이어 방어력 차감
    mob_dmg = (counter_crit) ? mob_dmg * mob.crit_strike : mob_dmg // 연속공격 적용
    mob_dmg = Math.floor(mob_dmg); // 최종데미지에서 소숫점 아래 버림

    // 플레이어 공격  
    printAndLog(chalk.greenBright('적을 공격합니다:'), logs);
    // 명중 실패 시:
    if (!hit) {
      printAndLog(chalk.white(` MISS!`), logs);
    // 공격이 블록당했을 때:
    } else if (!player_crit && mob_blocked) {
      printAndLog(chalk.whiteBright(` BLOCKED!`), logs);
    // 공격 성공 시:
    } else {
      mob.hp -= player_dmg; // 몬스터 체력 감소
      if (player_crit) { // 연속공격
        printAndLog(chalk.magentaBright.bold(` ${player_dmg} (${this.crit_string}) 의 피해를 입혔습니다!`), logs);
      } else {
        printAndLog(chalk.cyanBright.bold(` ${player_dmg} 의 피해를 입혔습니다!`), logs);
      }
      if (mob.hp <= 0) { // 몬스터 사망
        printAndLog(chalk.cyanBright.bold('몬스터를 처치했습니다!'), logs);
      }

      this.accuracy = Math.min( this.accuracy + this.accuracy_growth, 100 ); // 명중률 성장
      printAndLog(chalk.yellowBright(` 명중률 +${this.accuracy_growth}% 성장!`), logs);
      if (player_crit) {
        this.crit_rate = Math.min( this.crit_rate + this.crate_growth, 100 ); // 연속공격률 성장
        printAndLog(chalk.yellowBright(` 연속공격률 +${this.crate_growth}% 성장!`), logs);
      }
    }

    // 적 반격:
    if ( !player_crit && mob_countered && mob.hp > 0 ) {
      this.hp -= mob_dmg; // 몬스터 체력 감소
      printAndLog(chalk.greenBright('적이 반격합니다:'), logs);
      if (counter_crit) { // 연속공격
        printAndLog(chalk.magentaBright.bold(` ${mob_dmg} (${mob.crit_string}) 의 피해를 받았습니다!`), logs);
      } else {
        printAndLog(chalk.redBright.bold(` ${mob_dmg} 의 피해를 받았습니다!`), logs);
      }
      if (this.hp <= 0) { // 플레이어 사망
        printAndLog(chalk.redBright.bold('사망했습니다!'), logs);
      }
    }
  }

  // 방어하기
  defend(logs) {
    this.defense_mode = true;
    printAndLog("몬스터의 공격에 대비해 방어태세를 갖춥니다.", logs);
  }

  // 도망치기
  escape(stage, logs) { 
    // 방어모드 해제
    this.defense_mode = false;

    // 보스전 도주 불가
    if (stage == 10) {
      printAndLog("보스전에서는 도망칠 수 없습니다! 도주에 실패했습니다.", logs);
    } 
    
    const escape_success = rand(100) < this.escape_rate; // 도주 성공 판정
    if (escape_success) {
      printAndLog("도주에 성공했습니다!", logs);
      this.escaped = true;
    } else {
      printAndLog("도주에 실패했습니다!", logs);
    }
  }

  // 공격력 보너스 계산
  strength_bonus() {
    return this.strength_bonus_range[ rand( this.strength_bonus_range.length ) ];
  }

  // 방어력 보너스 계산
  defense_bonus() {
    return this.defense_bonus_range[ rand( this.defense_bonus_range.length ) ];
  }

}

class Mob {
  constructor(stage) {
    // 기초 스탯
    this.hp = 30 + (10 * ( stage - 1 ) ); // 체력
    this.strength = Math.floor( 5 + (1.5 * ( stage - 1 ) ) ); // 공격력
    this.defense = Math.floor( 0 + (1 * ( stage - 1 ) ) ); // 방어력

    // 특수 스탯
    this.accuracy = ( 50 + 5 * ( stage - 1 ) ); // 명중률 (0 ~ 100)
    this.block = ( 20 + 3 * ( stage - 1 ) ); // 블록률 (0 ~ 100) >> `방어하기` 행동 없이 발동
    this.counter = ( 20 + 4 * ( stage - 1 ) ); // 반격력 (0 ~ 100)

    // 연속공격 스탯
    this.crit_rate = ( 20 + 2 * ( stage - 1 ) ); // 연속공격률 (0 ~ 100)
    this.crit_strike = (stage === 10) ? 3 : 2; // 보스는 삼연격
    this.counter_crit = (stage === 10) ? true : false; // 보스는 반격으로도 연속 공격이 가능
    this.crit_string = (stage === 10) ? 'TRIPLE ATTACK' :'DOUBLE ATTACK';
  }

  // 공격하기
  attack(player, logs) {
    const hit = rand(100) < this.accuracy; // 명중 판정
    const mob_crit = rand(100) < this.crit_rate // 몬스터 연속공격 판정

    const player_blocked = player.defense_mode && (rand(100) < player.block); // 플레이어 블록 판정
    const player_countered = rand(100) < player.counter; // 플레이어 반격 판정
    const counter_hit = rand(100) < player.accuracy; // 플레이어 반격 명중 판정
    const counter_crit = rand(100) < Number(player.counter_crit && player.crit_rate); // 플레이어 반격 연속공격 판정

    // 몬스터 데미지
    let mob_dmg = Math.max( this.strength - player.defense, 0); // 플레이어 방어력 차감
    mob_dmg = (mob_crit) ? mob_dmg * this.crit_strike : mob_dmg // 연속공격 적용
    mob_dmg = (player.defense_mode) ? mob_dmg * 0.5 : mob_dmg; // 방어모드시 데미지 50% 경감
    mob_dmg = Math.floor(mob_dmg); // 최종 데미지에서 소숫점 아래 버림
    // 플레이어 반격 데미지
    let player_dmg = Math.max( player.strength - this.defense, 0); // 몬스터 방어력 차감
    player_dmg = (counter_crit) ? player_dmg * player.crit_strike : player_dmg // 연속공격 적용
    player_dmg = Math.floor(player_dmg); // 최종 데미지에서 소숫점 아래 버림
    
    // 몬스터 공격  
    printAndLog(chalk.greenBright('적이 공격합니다:'), logs);
    // 명중 실패 시:
    if (!hit) {
      printAndLog(chalk.white(` MISS!`), logs);
    // 공격이 블록당했을 때:
    } else if ( !mob_crit && player_blocked ) {
      printAndLog(chalk.whiteBright(` BLOCKED!`), logs);
      // 플레이어 블록률 성장
      player.block = Math.min( player.block + player.block_growth, 100 ); 
      printAndLog(chalk.yellowBright(` 블록률 +${player.block_growth}% 성장!`), logs);
    // 공격 성공 시:
    } else {
      player.hp -= mob_dmg; // 플레이어 체력 감소
      if (mob_crit) { // 연속공격
        printAndLog(chalk.magentaBright.bold(` ${mob_dmg} (${this.crit_string}) 의 피해를 받았습니다!`), logs);
      } else {
        printAndLog(chalk.redBright(` ${mob_dmg} 의 피해를 받았습니다!`), logs);
      }
      if (player.hp <= 0) { // 플레이어 사망
        printAndLog(chalk.redBright.bold('사망했습니다!'), logs);
      }
    }

    // 플레이어 반격:
    if ( !mob_crit && player_countered && player.hp > 0 ) {

      this.hp -= player_dmg; // 몬스터 체력 감소
      printAndLog(chalk.greenBright('적을 반격합니다:'), logs);

      if (counter_crit) { // 연속공격
        printAndLog(chalk.magentaBright.bold(` ${player_dmg} (${player.crit_string}) 의 피해를 입혔습니다!`), logs)
        player.crit_rate = Math.min( player.crit_rate + player.crate_growth, 100); 
        printAndLog(chalk.yellowBright(` 연속공격률 +${player.crate_growth}% 성장!`), logs);
      } else {
        printAndLog(chalk.cyanBright(` ${player_dmg}의 피해를 입혔습니다!`), logs);
      }

      // 플레이어 반격률 성장
      player.counter = Math.min( player.counter + player.counter_growth, 100); 
      printAndLog(chalk.yellowBright(` 반격률 +${player.counter_growth}% 성장!`), logs);

      if (this.hp <= 0) { // 몬스터 사망
        printAndLog(chalk.cyanBright.bold('몬스터를 처치했습니다!'), logs);
      }
    }
  }
}

function displayStatus(stage, player, mob) {
  console.log(chalk.magentaBright(`\n\n\n\n=== Current Status ===`));
  console.log(
    chalk.whiteBright(`| Stage: ${stage} |\n\n`) +
    chalk.blueBright(
      `| 플레이어 정보 |
       | HP : ${player.hp} |
       | 공격력: ${player.strength} |
       | 방어력: ${player.defense} |
       | 명중률: ${player.accuracy}% |
       | 블록률: ${player.block}% |
       | 반격률: ${player.counter}% |
       | 연속공격률: ${player.crit_rate}% |
       \n`,
    ) +
    chalk.redBright(
      `| 몬스터 정보 |
       | HP : ${mob.hp} |
       | 공격력: ${mob.strength} |
       | 방어력: ${mob.defense} |
       | 명중률: ${mob.accuracy}% |
       | 블록률: ${mob.block}% |
       | 반격률: ${mob.counter}% |
       | 연속공격률: ${mob.crit_rate}% |`,
    ),
  );
  // console.log(chalk.magentaBright(`=====================\n`));
  // console.log('');
}

const battle = async (stage, player, mob) => {
  let logs = [];

  let turn = 1;
  while(player.hp > 0 && mob.hp > 0) {
    console.clear();
    displayStatus(stage, player, mob);
    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 공격한다 2. 방어한다 3. 도망친다`,
      ),
    );

    printAndLog(chalk.whiteBright(`\n====== Turn ${turn} ======`), logs);
    
    // 플레이어 페이즈
    printAndLog(chalk.cyanBright(`| 플레이어 턴 |`), logs);
    let player_choice = Number(readlineSync.question('당신의 선택은? '));

    let invalidInput = false;
    do {
      switch (player_choice) {
        case 1 : // 공격한다
          invalidInput = false;
          player.attack(mob, logs);
          break;
        case 2: // 방어한다
          invalidInput = false;
          player.defend(logs);
          break;
        case 3 : // 도망친다
          invalidInput = false;
          player.escape(stage, logs);
          break;
        default : // 유효하지 않은 입력일 경우 다시 입력 받음
          invalidInput = true;
          player_choice = Number(readlineSync.question('올바른 선택을 하세요.'));
          break;
      } 
    } while (invalidInput);
    

    // 도주 성공시 스테이지 종료
    if (player.escaped) break;
    
    // 몬스터 페이즈
    if ( mob.hp > 0 && player.hp > 0 ) { // 전투가 이미 끝났으면 페이즈 스킵
      printAndLog(``, logs);
      printAndLog(chalk.redBright(`| 몬스터 턴 |`), logs);
      let mob_action = rand(0) + 1;
      switch (mob_action) {
        case 1 : // 공격한다
          mob.attack(player, logs);
          break;
        default :
          break;
      }
    }
    turn++;
  }

  // 전투 결과 출력
  if (mob.hp <= 0 && stage === 10) { // 보스 클리어!!!
    console.log(chalk.cyanBright.bold('GAME CLEAR!'));

  } else if (mob.hp <= 0 || player.escaped ) { // 몬스터 사망 or 도주 성공
    console.log(chalk.greenBright.bold('Stage Clear!'));

    // 스테이지 클리어보상
    if (!player.escaped) { 
      console.log(
        chalk.green(
          `\n1. 무기 강화 (공격력+) 2. 방어구 강화 (방어력+) 3. 휴식 (HP 회복)`,
        ),
      );
      let player_choice = Number(readlineSync.question('클리어 보상을 선택하세요:'));

      let bonus = 0;
      let invalidInput = false;
      do {
        switch (player_choice) {
          case 1 : // 무기 강화 (공격력 증가)
            invalidInput = false;
            bonus = player.strength_bonus();
            player.strength += bonus;
            console.log(chalk.greenBright(`공격력이 ${bonus} 강화되었습니다!`));
            break;
          case 2 : // 방어구 강화 (방어력 증가)
            invalidInput = false;
            bonus = player.defense_bonus();
            player.defense += bonus;
            console.log(chalk.greenBright(`방어력이 ${bonus} 강화되었습니다!`));
            break;
          case 3 : // 휴식 (HP 회복)
            invalidInput = false;
            player.hp += player.recovery;
            console.log(chalk.greenBright(`HP를 ${player.recovery} 회복했습니다!`));
            break;
          default : // 유효하지 않은 입력일 경우 다시 입력 받음
            invalidInput = true;
            player_choice = Number(readlineSync.question('올바른 선택을 하세요.'));
            break;
        }
      } while (invalidInput);

    } else { // 도망쳤을 경우 클리어 보상 스킵
      player.escaped = false;
    }

    // 다음 스테이지로
    const player_choice = Number(readlineSync.question('Next Stage: press enter'));

  } else if (player.hp <= 0) { // 플레이어 사망
    console.log(chalk.redBright.bold('GAME OVER!'));
    console.log(chalk.redBright.bold('전투가 어렵다면 타이틀에서 도움말을 읽어보세요!'));
  }
};

export async function startGame() {
  console.clear();

  let stage = 1;
  const player = new Player(stage);

  while (stage <= 10) {
    const mob = new Mob(stage);
    await battle(stage, player, mob);

    // 스테이지 클리어 및 게임 종료 조건
    if (player.hp <= 0) {
      break;
    }

    stage++;
  }
}