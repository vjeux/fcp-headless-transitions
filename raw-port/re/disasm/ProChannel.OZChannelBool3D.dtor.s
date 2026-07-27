__ZN15OZChannelBool3DD2Ev:
00000000000539ec	pushq	%rbp
00000000000539ed	movq	%rsp, %rbp
00000000000539f0	pushq	%rbx
00000000000539f1	pushq	%rax
00000000000539f2	movq	%rdi, %rbx
00000000000539f5	leaq	0x84324(%rip), %rax
00000000000539fc	movq	%rax, (%rdi)
00000000000539ff	leaq	0x84652(%rip), %rax
0000000000053a06	movq	%rax, 0x10(%rdi)
0000000000053a0a	addq	$0x1b8, %rdi                    ## imm = 0x1B8
0000000000053a11	callq	__ZN13OZChannelBoolD1Ev         ## OZChannelBool::~OZChannelBool()
0000000000053a16	leaq	0x120(%rbx), %rdi
0000000000053a1d	callq	__ZN13OZChannelBoolD1Ev         ## OZChannelBool::~OZChannelBool()
0000000000053a22	leaq	0x88(%rbx), %rdi
0000000000053a29	callq	__ZN13OZChannelBoolD1Ev         ## OZChannelBool::~OZChannelBool()
0000000000053a2e	movq	%rbx, %rdi
0000000000053a31	addq	$0x8, %rsp
0000000000053a35	popq	%rbx
0000000000053a36	popq	%rbp
0000000000053a37	jmp	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
