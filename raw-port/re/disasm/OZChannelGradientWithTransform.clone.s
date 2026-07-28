__ZNK30OZChannelGradientWithTransform5cloneEv:
0000000000499330	pushq	%rbp
0000000000499331	movq	%rsp, %rbp
0000000000499334	pushq	%r14
0000000000499336	pushq	%rbx
0000000000499337	movq	%rdi, %r14
000000000049933a	movl	$0xca8, %edi                    ## imm = 0xCA8
000000000049933f	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000499344	movq	%rax, %rbx
0000000000499347	movq	%rax, %rdi
000000000049934a	movq	%r14, %rsi
000000000049934d	xorl	%edx, %edx
000000000049934f	callq	__ZN30OZChannelGradientWithTransformC2ERKS_P15OZChannelFolder ## OZChannelGradientWithTransform::OZChannelGradientWithTransform(OZChannelGradientWithTransform const&, OZChannelFolder*)
0000000000499354	movq	%rbx, %rax
0000000000499357	popq	%rbx
0000000000499358	popq	%r14
000000000049935a	popq	%rbp
000000000049935b	retq
000000000049935c	movq	%rax, %r14
000000000049935f	movq	%rbx, %rdi
0000000000499362	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000499367	movq	%r14, %rdi
000000000049936a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000049936f	nop
