__ZN15AUMultiplyMixer6RenderERjRK14AudioTimeStampj:
0000000001245230	pushq	%rbp
0000000001245231	movq	%rsp, %rbp
0000000001245234	subq	$0x20, %rsp
0000000001245238	movl	%ecx, %r8d
000000000124523b	movq	%rdx, %rcx
000000000124523e	movq	%rsi, %rdx
0000000001245241	movq	$0x0, -0x10(%rbp)
0000000001245249	leaq	0x6dac18(%rip), %rax
0000000001245250	movq	%rax, -0x18(%rbp)
0000000001245254	movb	$0x0, -0x8(%rbp)
0000000001245258	leaq	-0x18(%rbp), %rsi
000000000124525c	callq	__ZN16AUMultiInputBase12RenderInputsEPNS_15InputBusHandlerERjRK14AudioTimeStampj ## AUMultiInputBase::RenderInputs(AUMultiInputBase::InputBusHandler*, unsigned int&, AudioTimeStamp const&, unsigned int)
0000000001245261	addq	$0x20, %rsp
0000000001245265	popq	%rbp
0000000001245266	retq
0000000001245267	nopw	(%rax,%rax)
