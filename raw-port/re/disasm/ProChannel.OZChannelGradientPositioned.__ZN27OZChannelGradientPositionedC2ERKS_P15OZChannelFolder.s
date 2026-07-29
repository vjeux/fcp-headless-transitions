__ZN27OZChannelGradientPositionedC2ERKS_P15OZChannelFolder:
000000000006d6c0	pushq	%rbp
000000000006d6c1	movq	%rsp, %rbp
000000000006d6c4	pushq	%r15
000000000006d6c6	pushq	%r14
000000000006d6c8	pushq	%rbx
000000000006d6c9	pushq	%rax
000000000006d6ca	movq	%rsi, %r14
000000000006d6cd	movq	%rdi, %rbx
000000000006d6d0	callq	__ZN23OZChannelGradientExtrasC2ERKS_P15OZChannelFolder ## OZChannelGradientExtras::OZChannelGradientExtras(OZChannelGradientExtras const&, OZChannelFolder*)
000000000006d6d5	leaq	0x6dc74(%rip), %rax
000000000006d6dc	movq	%rax, (%rbx)
000000000006d6df	leaq	0x6df42(%rip), %rax
000000000006d6e6	movq	%rax, 0x10(%rbx)
000000000006d6ea	movl	$0x420, %esi                    ## imm = 0x420
000000000006d6ef	leaq	(%rbx,%rsi), %r15
000000000006d6f3	addq	%r14, %rsi
000000000006d6f6	movq	%r15, %rdi
000000000006d6f9	movq	%rbx, %rdx
000000000006d6fc	callq	__ZN17OZChannelPositionC1ERKS_P15OZChannelFolder ## OZChannelPosition::OZChannelPosition(OZChannelPosition const&, OZChannelFolder*)
000000000006d701	movl	$0x6e0, %esi                    ## imm = 0x6E0
000000000006d706	leaq	(%rbx,%rsi), %rdi
000000000006d70a	addq	%r14, %rsi
000000000006d70d	movq	%rbx, %rdx
000000000006d710	callq	__ZN17OZChannelPositionC1ERKS_P15OZChannelFolder ## OZChannelPosition::OZChannelPosition(OZChannelPosition const&, OZChannelFolder*)
000000000006d715	movb	0x9a0(%r14), %al
000000000006d71c	movb	%al, 0x9a0(%rbx)
000000000006d722	addq	$0x8, %rsp
000000000006d726	popq	%rbx
000000000006d727	popq	%r14
000000000006d729	popq	%r15
000000000006d72b	popq	%rbp
000000000006d72c	retq
000000000006d72d	movq	%rax, %r14
000000000006d730	movq	%r15, %rdi
000000000006d733	callq	__ZN17OZChannelPositionD1Ev     ## OZChannelPosition::~OZChannelPosition()
000000000006d738	jmp	0x6d73d
000000000006d73a	movq	%rax, %r14
000000000006d73d	movq	%rbx, %rdi
000000000006d740	callq	__ZN23OZChannelGradientExtrasD2Ev ## OZChannelGradientExtras::~OZChannelGradientExtras()
000000000006d745	movq	%r14, %rdi
000000000006d748	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000006d74d	nop
