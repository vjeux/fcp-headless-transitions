__ZNK24OZChannelHistogramSample5cloneEv:
00000000000717ac	pushq	%rbp
00000000000717ad	movq	%rsp, %rbp
00000000000717b0	pushq	%r14
00000000000717b2	pushq	%rbx
00000000000717b3	movq	%rdi, %r14
00000000000717b6	movl	$0x380, %edi                    ## imm = 0x380
00000000000717bb	callq	0xace4c                         ## symbol stub for: __Znwm
00000000000717c0	movq	%rax, %rbx
00000000000717c3	movq	%rax, %rdi
00000000000717c6	movq	%r14, %rsi
00000000000717c9	xorl	%edx, %edx
00000000000717cb	callq	__ZN24OZChannelHistogramSampleC2ERKS_P15OZChannelFolder ## OZChannelHistogramSample::OZChannelHistogramSample(OZChannelHistogramSample const&, OZChannelFolder*)
00000000000717d0	movq	%rbx, %rax
00000000000717d3	popq	%rbx
00000000000717d4	popq	%r14
00000000000717d6	popq	%rbp
00000000000717d7	retq
00000000000717d8	movq	%rax, %r14
00000000000717db	movq	%rbx, %rdi
00000000000717de	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000717e3	movq	%r14, %rdi
00000000000717e6	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000717eb	nop
