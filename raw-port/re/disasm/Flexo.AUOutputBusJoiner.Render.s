__ZN17AUOutputBusJoiner6RenderERjRK14AudioTimeStampj:
00000000012456a0	pushq	%rbp
00000000012456a1	movq	%rsp, %rbp
00000000012456a4	subq	$0x10, %rsp
00000000012456a8	movl	%ecx, %r8d
00000000012456ab	movq	%rdx, %rcx
00000000012456ae	movq	%rsi, %rdx
00000000012456b1	movq	$0x0, -0x8(%rbp)
00000000012456b9	leaq	0x6daa78(%rip), %rax
00000000012456c0	movq	%rax, -0x10(%rbp)
00000000012456c4	leaq	-0x10(%rbp), %rsi
00000000012456c8	callq	__ZN16AUMultiInputBase12RenderInputsEPNS_15InputBusHandlerERjRK14AudioTimeStampj ## AUMultiInputBase::RenderInputs(AUMultiInputBase::InputBusHandler*, unsigned int&, AudioTimeStamp const&, unsigned int)
00000000012456cd	addq	$0x10, %rsp
00000000012456d1	popq	%rbp
00000000012456d2	retq
00000000012456d3	nopw	%cs:(%rax,%rax)
