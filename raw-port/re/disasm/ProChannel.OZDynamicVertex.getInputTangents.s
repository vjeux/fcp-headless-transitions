__ZN15OZDynamicVertex16getInputTangentsEPdS0_RK6CMTime:
000000000003eaca	pushq	%rbp
000000000003eacb	movq	%rsp, %rbp
000000000003eace	pushq	%rbx
000000000003eacf	pushq	%rax
000000000003ead0	movq	%rdx, %rbx
000000000003ead3	testq	%rsi, %rsi
000000000003ead6	je	0x3eadf
000000000003ead8	movq	$0x0, (%rsi)
000000000003eadf	testq	%rbx, %rbx
000000000003eae2	je	0x3eafa
000000000003eae4	addq	$0x280, %rdi                    ## imm = 0x280
000000000003eaeb	xorps	%xmm0, %xmm0
000000000003eaee	movq	%rcx, %rsi
000000000003eaf1	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000003eaf6	movsd	%xmm0, (%rbx)
000000000003eafa	addq	$0x8, %rsp
000000000003eafe	popq	%rbx
000000000003eaff	popq	%rbp
000000000003eb00	retq
000000000003eb01	nop
