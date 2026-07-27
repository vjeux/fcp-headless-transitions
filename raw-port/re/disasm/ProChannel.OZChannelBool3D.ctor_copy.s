__ZN15OZChannelBool3DC2ERKS_P15OZChannelFolder:
0000000000053472	pushq	%rbp
0000000000053473	movq	%rsp, %rbp
0000000000053476	pushq	%r15
0000000000053478	pushq	%r14
000000000005347a	pushq	%r12
000000000005347c	pushq	%rbx
000000000005347d	movq	%rsi, %r15
0000000000053480	movq	%rdi, %rbx
0000000000053483	callq	__ZN17OZCompoundChannelC2ERKS_P15OZChannelFolder ## OZCompoundChannel::OZCompoundChannel(OZCompoundChannel const&, OZChannelFolder*)
0000000000053488	leaq	0x84891(%rip), %rax
000000000005348f	movq	%rax, (%rbx)
0000000000053492	leaq	0x84bbf(%rip), %rax
0000000000053499	movq	%rax, 0x10(%rbx)
000000000005349d	movl	$0x88, %esi
00000000000534a2	leaq	(%rbx,%rsi), %r14
00000000000534a6	addq	%r15, %rsi
00000000000534a9	movq	%r14, %rdi
00000000000534ac	movq	%rbx, %rdx
00000000000534af	callq	__ZN13OZChannelBoolC1ERKS_P15OZChannelFolder ## OZChannelBool::OZChannelBool(OZChannelBool const&, OZChannelFolder*)
00000000000534b4	movl	$0x120, %esi                    ## imm = 0x120
00000000000534b9	leaq	(%rbx,%rsi), %r12
00000000000534bd	addq	%r15, %rsi
00000000000534c0	movq	%r12, %rdi
00000000000534c3	movq	%rbx, %rdx
00000000000534c6	callq	__ZN13OZChannelBoolC1ERKS_P15OZChannelFolder ## OZChannelBool::OZChannelBool(OZChannelBool const&, OZChannelFolder*)
00000000000534cb	movl	$0x1b8, %eax                    ## imm = 0x1B8
00000000000534d0	leaq	(%rbx,%rax), %rdi
00000000000534d4	addq	%rax, %r15
00000000000534d7	movq	%r15, %rsi
00000000000534da	movq	%rbx, %rdx
00000000000534dd	callq	__ZN13OZChannelBoolC1ERKS_P15OZChannelFolder ## OZChannelBool::OZChannelBool(OZChannelBool const&, OZChannelFolder*)
00000000000534e2	popq	%rbx
00000000000534e3	popq	%r12
00000000000534e5	popq	%r14
00000000000534e7	popq	%r15
00000000000534e9	popq	%rbp
00000000000534ea	retq
00000000000534eb	movq	%rax, %r15
00000000000534ee	movq	%r12, %rdi
00000000000534f1	callq	__ZN13OZChannelBoolD1Ev         ## OZChannelBool::~OZChannelBool()
00000000000534f6	jmp	0x534fb
00000000000534f8	movq	%rax, %r15
00000000000534fb	movq	%r14, %rdi
00000000000534fe	callq	__ZN13OZChannelBoolD1Ev         ## OZChannelBool::~OZChannelBool()
0000000000053503	jmp	0x53508
0000000000053505	movq	%rax, %r15
0000000000053508	movq	%rbx, %rdi
000000000005350b	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000053510	movq	%r15, %rdi
0000000000053513	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
