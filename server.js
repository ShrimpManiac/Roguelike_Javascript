import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import {startGame} from "./game.js";

// 로비 화면을 출력하는 함수
function displayLobby() {
    console.clear();

    // 타이틀 텍스트
    console.log(
        chalk.cyan(
            figlet.textSync('RL- Javascript', {
                font: 'Standard',
                horizontalLayout: 'default',
                verticalLayout: 'default'
            })
        )
    );

    // 상단 경계선
    const line = chalk.magentaBright('='.repeat(50));
    console.log(line);

    // 게임 이름
    console.log(chalk.yellowBright.bold('CLI 게임에 오신것을 환영합니다!'));

    // 설명 텍스트
    console.log(chalk.green('옵션을 선택해주세요.'));
    console.log();

    // 옵션들
    console.log(chalk.blue('1.') + chalk.white(' 새로운 게임 시작'));
    console.log(chalk.blue('2.') + chalk.white(' 도움말'));
    console.log(chalk.blue('3.') + chalk.white(' 업적 확인하기 (미구현)'));
    console.log(chalk.blue('4.') + chalk.white(' 옵션 (미구현)'));
    console.log(chalk.blue('5.') + chalk.white(' 종료'));

    // 하단 경계선
    console.log(line);

    // 하단 설명
    console.log(chalk.gray('1-5 사이의 수를 입력한 뒤 엔터를 누르세요.'));
}

// 유저 입력을 받아 처리하는 함수
function handleUserInput() {
    const choice = readlineSync.question('입력: ');

    switch (choice) {
        case '1':
            console.log(chalk.green('게임을 시작합니다.'));
            // 여기에서 새로운 게임 시작 로직을 구현
            startGame();
            break;
        case '2':
            // 여기에서 전투 규칙 (도움말) 로직을 구현
            console.log(chalk.whiteBright('============ 도움말 ============'));
            console.log(
                chalk.greenBright(
                    `| 기초 스탯 |
                    - HP : 플레이어의 체력으로 0이 되면 사망합니다.
                    - 공격력 : 공격 성공 시 해당 수치만큼 적에게 피해를 입힙니다.
                    - 방어력 : 적의 공격력에서 해당 수치만큼 차감합니다.
                    - 기초 스탯은 오로지 전투보상 및 장비로만 성장이 가능합니다.
                    \n`,
                ) +
                chalk.cyanBright(
                    `| 특수 스탯 |
                    - 명중률 : 공격이 성공할 확률입니다.
                    - 블록률 : 적의 공격을 무효화할 확률로 '방어하기'를 선택했을 때만 발동합니다.
                    - 반격률 : 적의 공격에 반격할 확률로 적이 선공했을 때만 발동합니다.
                    - 전투 중 특정 액션을 성공시킴으로써 특수 스탯을 성장시킬 수 있습니다.
                    \n`,
                ) +
                chalk.magentaBright(
                    `| 연속공격 |
                    - 연속공격은 적의 블록을 무시하며 반격이 발동되지 않습니다.
                    - 연속공격은 기본적으로 선공에만 발동하지만 반격 발동이 가능해지는 장비가 존재합니다.
                    - 연속공격으로 인한 추가타는 1회이지만 이를 강화하는 장비가 존재합니다.
                    \n`,
                ) +
                chalk.yellowBright(
                    `| 성장 보너스 |
                    - 명중률 : 선공으로 적에게 데미지를 가하면 성장합니다.
                    - 블록률 : 블록 성공 시 성장합니다.
                    - 반격률 : 반격 성공 시 성장합니다.
                    - 연속공격률 : 연속 공격을 성공시키면 성장합니다.
                    \n`,
                ) +
                chalk.blueBright(
                    `| 플레이어 페이즈 |
                    - 공격하기 : 적에게 선공을 가합니다. 치명타 공격이 발생할 확률이 있습니다.
                    - 방어하기 : 1턴동안 피격 데미지를 50% 감소시키고 일정 확률로 적의 공격을 블록합니다.
                    - 도망치기 : 일정 확률로 전투에서 도망칩니다. 도망시 전투보상을 획득할 수 없습니다.
                    \n`,
                ) +
                chalk.redBright(
                    `| 적 페이즈 |
                    - 몬스터는 '방어하기' 행동이 없지만 플레이어의 선공을 항상 블록할 확률이 있습니다.
                    - '공격하기' 이외에도 고유한 특수행동을 가진 몬스터들이 존재합니다. 
                    - 몬스터는 도망치지 않습니다.
                    - 몬스터는 성장 보너스를 받지 않습니다.
                    \n`,
                ),
            );
            console.log(chalk.whiteBright(`========================\n`));
            const returnToTitle = readlineSync.question('Enter를 눌러서 타이틀로 돌아가기');
            displayLobby();
            handleUserInput();
            break;
        case '3':
            console.log(chalk.yellow('구현 준비중입니다.. 게임을 시작하세요'));
            // 업적 확인하기 로직을 구현
            handleUserInput();
            break;
        case '4':
            console.log(chalk.blue('구현 준비중입니다.. 게임을 시작하세요'));
            // 옵션 메뉴 로직을 구현
            handleUserInput();
            break;
        case '5':
            console.log(chalk.red('게임을 종료합니다.'));
            // 게임 종료 로직을 구현
            process.exit(0); // 게임 종료
            break;
        default:
            console.log(chalk.red('올바른 선택을 하세요.'));
            handleUserInput(); // 유효하지 않은 입력일 경우 다시 입력 받음
    }
}

// 게임 시작 함수
function start() {
    displayLobby();
    handleUserInput();
}

// 게임 실행
start();