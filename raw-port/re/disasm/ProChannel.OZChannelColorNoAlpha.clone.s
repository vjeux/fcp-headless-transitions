__ZNK21OZChannelColorNoAlpha5cloneEv:
00000000000562c2	pushq	%rbp
00000000000562c3	movq	%rsp, %rbp
00000000000562c6	pushq	%r14
00000000000562c8	pushq	%rbx
00000000000562c9	movq	%rdi, %r14
00000000000562cc	movl	$0x3f0, %edi                    ## imm = 0x3F0
00000000000562d1	callq	0xace4c                         ## symbol stub for: __Znwm
00000000000562d6	movq	%rax, %rbx
00000000000562d9	movq	%rax, %rdi
00000000000562dc	movq	%r14, %rsi
00000000000562df	xorl	%edx, %edx
00000000000562e1	callq	__ZN21OZChannelColorNoAlphaC2ERKS_P15OZChannelFolder ## OZChannelColorNoAlpha::OZChannelColorNoAlpha(OZChannelColorNoAlpha const&, OZChannelFolder*)
00000000000562e6	movq	%rbx, %rax
00000000000562e9	popq	%rbx
00000000000562ea	popq	%r14
00000000000562ec	popq	%rbp
00000000000562ed	retq
00000000000562ee	movq	%rax, %r14
00000000000562f1	movq	%rbx, %rdi
00000000000562f4	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000562f9	movq	%r14, %rdi
00000000000562fc	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000056301	nop
