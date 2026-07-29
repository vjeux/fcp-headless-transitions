__ZNK28OZChannelGradientSampleAlpha5cloneEv:
000000000006ed20	pushq	%rbp
000000000006ed21	movq	%rsp, %rbp
000000000006ed24	pushq	%r14
000000000006ed26	pushq	%rbx
000000000006ed27	movq	%rdi, %r14
000000000006ed2a	movl	$0x348, %edi                    ## imm = 0x348
000000000006ed2f	callq	0xace4c                         ## symbol stub for: __Znwm
000000000006ed34	movq	%rax, %rbx
000000000006ed37	movq	%rax, %rdi
000000000006ed3a	movq	%r14, %rsi
000000000006ed3d	xorl	%edx, %edx
000000000006ed3f	callq	__ZN28OZChannelGradientSampleAlphaC2ERKS_P15OZChannelFolder ## OZChannelGradientSampleAlpha::OZChannelGradientSampleAlpha(OZChannelGradientSampleAlpha const&, OZChannelFolder*)
000000000006ed44	movq	%rbx, %rax
000000000006ed47	popq	%rbx
000000000006ed48	popq	%r14
000000000006ed4a	popq	%rbp
000000000006ed4b	retq
000000000006ed4c	movq	%rax, %r14
000000000006ed4f	movq	%rbx, %rdi
000000000006ed52	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000006ed57	movq	%r14, %rdi
000000000006ed5a	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000006ed5f	nop
