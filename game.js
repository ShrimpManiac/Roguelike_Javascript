import chalk from 'chalk';
import readlineSync from 'readline-sync';

/** 
 * 0 ~ 99 사이의 숫자를 무작위로 생성하는 함수
*/
function rand(max) {
  return Math.floor(Math.random() * max);
}



class Player {
  constructor() {
    // 기초 스탯 (승리보상 및 장비로만 상승 가능)
    this.hp = 100; // 체력
    this.strength = 10; // 공격력
    this.defense = 1; // 방어력 (적 공격력에서 수치만큼 차감)

    // 특수 스탯 (전투로 성장 가능)
    this.accuracy = 70; // 명중률 (0 ~ 100)
    this.block = 30; // 블록률 (0 ~ 100) >> `방어하기`를 선택했을 때만 발동
    this.counter = 30; // 반격률 (0 ~ 100) >> 수비 페이즈에만 발동

    // 치명타 스탯 (전투로 성장 가능)
    this.crit_rate = 30; // 치명타 확률 (0 ~ 100) >> 치명타는 적의 블록과 반격을 무시한다.
    this.crit_dmg = 2; // 치명타 데미지 (2 = 2배)
    this.counter_crit = false // 치명타는 기본적으로 선공에만 발동하지만
                              // 특정 장비를 장착하면 반격 발동이 가능해진다.

    // 성장 보너스
    this.accuracy_growth = 1; // 명중률 : 선공으로 적에게 데미지를 가하면 성공
    this.block_growth = 1; // 블록률 : 블록 성공 시 성장
    this.counter_growth = 1; // 반격률 : 반격 성공 시 성장
    this.crate_growth = 1; // 치명타 확률 : 치명타로 적에게 데미지를 가하면 성장
  }

  // 공격하기
  attack(mob) {
    const hit = rand(100) < this.accuracy; // 명중 판정
    const player_crit = rand(100) < this.crit_rate // 플레이어 치명타 판정

    const mob_blocked = rand(100) < mob.block; // 몬스터 블록 판정
    const counter = rand(100) < mob.counter; // 몬스터 반격 판정
    const counter_hit = rand(100) < mob.accuracy; // 몬스터 반격 명중 판정
    const counter_crit = rand(100) < Number(mob.counter_crit && mob.crit_rate); // 몬스터 반격 치명타 판정

    const player_dmg = (player_crit) ? this.strength * this.crit_dmg : this.strength // 플레이어 데미지
    const mob_dmg = (counter_crit) ? mob.strength * mob.crit_dmg : mob.strength // 몬스터 반격 데미지
    
    // 플레이어 공격  
    console.log(chalk.greenBright('적을 공격합니다:'));
    // 명중 실패 시:
    if (!hit) {
      console.log(chalk.white(`MISS!`));
    // 공격이 블록당했을 때:
    } else if (mob_blocked) {
      console.log(chalk.whiteBright(`BLOCKED!`));
    // 공격 성공 시:
    } else {
      mob.hp -= Math.floor(player_dmg); // 몬스터 체력 감소
      if (player_crit) { // 치명타
        console.log(chalk.magentaBright.bold(`-${player_dmg}`));
      } else {
        console.log(chalk.cyanBright(`-${player_dmg}`));
      }

      this.accuracy += this.accuracy_growth; // 명중률 성장
      console.log(chalk.yellowBright(`명중률 +${this.accuracy_growth}% 성장!`));
      if (player_crit) {
        this.crit_rate++; // 치명타 성장
        console.log(chalk.yellowBright(`치명타 확률 +${this.crate_growth}% 성장!`));
      }
    }

    // 적 반격:
    if ( !player_crit && counter ) {
      this.hp -= Math.floor(mob_dmg); // 몬스터 체력 감소
      console.log(chalk.greenBright('적이 반격합니다:'));
      if (counter_crit) { // 치명타
        console.log(chalk.magentaBright.bold(`-${mob_dmg}`));
      } else {
        console.log(chalk.redBright(`-${mob_dmg}`));
      }
    }
  }

  // 도망치기
  escape() {
    
  }
}

class Mob {
  constructor() {
    // 스테이지
    this.stage = 1;

    // 기초 스탯
    this.hp = 30; // 체력
    this.strength = 5; // 공격력
    this.defense = 0; // 방어력

    // 특수 스탯
    this.accuracy = 70; // 명중률 (0 ~ 100)
    this.block = 20; // 블록률 (0 ~ 100) >> `방어하기` 행동 없이 발동
    this.counter = 20; // 반격력 (0 ~ 100)

    // 치명타 스탯
    this.crit_rate = 20; // 치명타 확률 (0 ~ 100)
    this.crit_dmg = 2; // 치명타 데미지 (2 = 2배)
    this.counter_crit = false;
  }

  // 공격하기
  attack(player) {
    const hit = rand(100) < this.accuracy; // 명중 판정
    const mob_crit = rand(100) < this.crit_rate // 몬스터 치명타 판정

    const player_blocked = rand(100) < player.block; // 플레이어 블록 판정
    const counter = rand(100) < player.counter; // 플레이어 반격 판정
    const counter_hit = rand(100) < player.accuracy; // 플레이어 반격 명중 판정
    const counter_crit = rand(100) < Number(player.counter_crit && player.crit_rate); // 플레이어 반격 치명타 판정

    const mob_dmg = (mob_crit) ? this.strength * this.crit_dmg : this.strength // 몬스터 데미지
    const player_dmg = (counter_crit) ? player.strength * player.crit_dmg : player.strength // 플레이어 반격 데미지
    
    // 몬스터 공격  
    console.log(chalk.greenBright('적이 공격합니다:'));
    // 명중 실패 시:
    if (!hit) {
      console.log(chalk.white(`MISS!`));
    // 공격이 블록당했을 때:
    } else if (player_blocked) {
      console.log(chalk.whiteBright(`BLOCKED!`));
    // 공격 성공 시:
    } else {
      player.hp -= Math.floor(mob_dmg); // 몬스터 체력 감소
      if (mob_crit) { // 치명타
        console.log(chalk.magentaBright.bold(`-${mob_dmg}`));
      } else {
        console.log(chalk.redBright(`-${mob_dmg}`));
      }
    }

    // 플레이어 반격:
    if ( !mob_crit && counter ) {
      this.hp -= Math.floor(player_dmg); // 몬스터 체력 감소
      console.log(chalk.greenBright('적을 반격합니다:'));
      if (counter_crit) { // 치명타
        console.log(chalk.magentaBright.bold(`-${player_dmg}`));
      } else {
        console.log(chalk.cyanBright(`-${player_dmg}`));
      }
    }
  }
}

function displayStatus(stage, player, mob) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage}\n`) +
    chalk.blueBright(
      `| 플레이어 정보 |
       | HP : ${player.hp} |
       | 공격력: ${player.strength} |
       | 방어력: ${player.defense} |
       | 명중률: ${player.accuracy}% |
       | 블록률: ${player.block}% |
       | 반격률: ${player.counter}% |
       | 치명타 확률: ${player.crit_rate}% |
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
       | 치명타 확률: ${mob.crit_rate}% |`,
    ),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, mob) => {
  let logs = [];

  while(player.hp > 0) {
    // console.clear();
    displayStatus(stage, player, mob);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 공격한다 2. 도망친다.`,
      ),
    );
    const choice = readlineSync.question('당신의 선택은? ');

    // 플레이어의 선택에 따라 다음 행동 처리
    logs.push(chalk.green(`${choice}를 선택하셨습니다.`));
    switch (choice) {
      case "1" : // 공격한다
        player.attack(mob);
      case 2 : // 도망친다
        player.escape();
    }
  }
  
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const mob = new Mob(stage);
    await battle(stage, player, mob);

    // 스테이지 클리어 및 게임 종료 조건

    stage++;
  }
}