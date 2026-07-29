__ZNK23OZChannelGradientSample5cloneEv:
000000000006e2a0	pushq	%rbp
000000000006e2a1	movq	%rsp, %rbp
000000000006e2a4	pushq	%r14
000000000006e2a6	pushq	%rbx
000000000006e2a7	movq	%rdi, %r14
000000000006e2aa	movl	$0x2b0, %edi                    ## imm = 0x2B0
000000000006e2af	callq	0xace4c                         ## symbol stub for: __Znwm
000000000006e2b4	movq	%rax, %rbx
000000000006e2b7	movq	%rax, %rdi
000000000006e2ba	movq	%r14, %rsi
000000000006e2bd	xorl	%edx, %edx
000000000006e2bf	callq	__ZN23OZChannelGradientSampleC2ERKS_P15OZChannelFolder ## OZChannelGradientSample::OZChannelGradientSample(OZChannelGradientSample const&, OZChannelFolder*)
000000000006e2c4	movq	%rbx, %rax
000000000006e2c7	popq	%rbx
000000000006e2c8	popq	%r14
000000000006e2ca	popq	%rbp
000000000006e2cb	retq
000000000006e2cc	movq	%rax, %r14
000000000006e2cf	movq	%rbx, %rdi
000000000006e2d2	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000006e2d7	movq	%r14, %rdi
000000000006e2da	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000006e2df	nop
