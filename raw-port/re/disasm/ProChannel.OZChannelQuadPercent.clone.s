__ZNK20OZChannelQuadPercent5cloneEv:
00000000000a72d8	pushq	%rbp
00000000000a72d9	movq	%rsp, %rbp
00000000000a72dc	pushq	%r14
00000000000a72de	pushq	%rbx
00000000000a72df	movq	%rdi, %r14
00000000000a72e2	movl	$0x788, %edi                    ## imm = 0x788
00000000000a72e7	callq	0xace4c                         ## symbol stub for: __Znwm
00000000000a72ec	movq	%rax, %rbx
00000000000a72ef	movq	%rax, %rdi
00000000000a72f2	movq	%r14, %rsi
00000000000a72f5	xorl	%edx, %edx
00000000000a72f7	callq	__ZN20OZChannelQuadPercentC2ERKS_P15OZChannelFolder ## OZChannelQuadPercent::OZChannelQuadPercent(OZChannelQuadPercent const&, OZChannelFolder*)
00000000000a72fc	movq	%rbx, %rax
00000000000a72ff	popq	%rbx
00000000000a7300	popq	%r14
00000000000a7302	popq	%rbp
00000000000a7303	retq
00000000000a7304	movq	%rax, %r14
00000000000a7307	movq	%rbx, %rdi
00000000000a730a	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000a730f	movq	%r14, %rdi
00000000000a7312	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000a7317	nop
