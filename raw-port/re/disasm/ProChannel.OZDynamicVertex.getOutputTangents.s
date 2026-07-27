__ZN15OZDynamicVertex17getOutputTangentsEPdS0_RK6CMTime:
000000000003eb02	pushq	%rbp
000000000003eb03	movq	%rsp, %rbp
000000000003eb06	pushq	%rbx
000000000003eb07	pushq	%rax
000000000003eb08	movq	%rdx, %rbx
000000000003eb0b	testq	%rsi, %rsi
000000000003eb0e	je	0x3eb17
000000000003eb10	movq	$0x0, (%rsi)
000000000003eb17	testq	%rbx, %rbx
000000000003eb1a	je	0x3eb32
000000000003eb1c	addq	$0x318, %rdi                    ## imm = 0x318
000000000003eb23	xorps	%xmm0, %xmm0
000000000003eb26	movq	%rcx, %rsi
000000000003eb29	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000003eb2e	movsd	%xmm0, (%rbx)
000000000003eb32	addq	$0x8, %rsp
000000000003eb36	popq	%rbx
000000000003eb37	popq	%rbp
000000000003eb38	retq
000000000003eb39	nop
