__ZN11PCEvaluator20findLengthOfSineWaveEddddddi:
000000000000dce4	pushq	%rbp
000000000000dce5	movq	%rsp, %rbp
000000000000dce8	pushq	%r14
000000000000dcea	pushq	%rbx
000000000000dceb	subq	$0x70, %rsp
000000000000dcef	movq	%rdi, %rbx
000000000000dcf2	movl	$0x0, -0x20(%rbp)
000000000000dcf9	movsd	%xmm4, -0x78(%rbp)
000000000000dcfe	movsd	%xmm5, -0x70(%rbp)
000000000000dd03	movsd	%xmm0, -0x68(%rbp)
000000000000dd08	movsd	%xmm1, -0x60(%rbp)
000000000000dd0d	movsd	%xmm2, -0x58(%rbp)
000000000000dd12	movsd	%xmm3, -0x50(%rbp)
000000000000dd17	movl	%esi, -0x48(%rbp)
000000000000dd1a	xorps	%xmm0, %xmm0
000000000000dd1d	movups	%xmm0, -0x40(%rbp)
000000000000dd21	movups	%xmm0, -0x30(%rbp)
000000000000dd25	leaq	0x58(%rdi), %r14
000000000000dd29	movq	%r14, %rdi
000000000000dd2c	callq	__ZN10PCSpinLock4lockEv         ## PCSpinLock::lock()
000000000000dd31	leaq	-0x78(%rbp), %rsi
000000000000dd35	movq	%rbx, %rdi
000000000000dd38	callq	__ZN19PCEvaluatorWaveDataeqERKS_ ## PCEvaluatorWaveData::operator==(PCEvaluatorWaveData const&)
000000000000dd3d	testb	%al, %al
000000000000dd3f	jne	0xdd55
000000000000dd41	leaq	-0x78(%rbp), %rsi
000000000000dd45	movq	%rbx, %rdi
000000000000dd48	callq	__ZN19PCEvaluatorWaveDataaSERKS_ ## PCEvaluatorWaveData::operator=(PCEvaluatorWaveData const&)
000000000000dd4d	movq	%rbx, %rdi
000000000000dd50	callq	__ZN19PCEvaluatorWaveData17refreshWaveArraysEv ## PCEvaluatorWaveData::refreshWaveArrays()
000000000000dd55	movq	0x50(%rbx), %rax
000000000000dd59	movslq	0x30(%rbx), %rcx
000000000000dd5d	movsd	-0x8(%rax,%rcx,8), %xmm0
000000000000dd63	movsd	%xmm0, -0x18(%rbp)
000000000000dd68	movq	%r14, %rdi
000000000000dd6b	callq	__ZN10PCSpinLock6unlockEv       ## PCSpinLock::unlock()
000000000000dd70	leaq	-0x78(%rbp), %rdi
000000000000dd74	callq	__ZN19PCEvaluatorWaveDataD2Ev   ## PCEvaluatorWaveData::~PCEvaluatorWaveData()
000000000000dd79	movsd	-0x18(%rbp), %xmm0
000000000000dd7e	addq	$0x70, %rsp
000000000000dd82	popq	%rbx
000000000000dd83	popq	%r14
000000000000dd85	popq	%rbp
000000000000dd86	retq
000000000000dd87	jmp	0xdd89
000000000000dd89	movq	%rax, %rbx
000000000000dd8c	leaq	-0x78(%rbp), %rdi
000000000000dd90	callq	__ZN19PCEvaluatorWaveDataD2Ev   ## PCEvaluatorWaveData::~PCEvaluatorWaveData()
000000000000dd95	movq	%rbx, %rdi
000000000000dd98	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
000000000000dd9d	addb	%al, (%rax)
000000000000dd9f	addb	%dl, 0x48(%rbp)
000000000000dda2	movl	%esp, %ebp
000000000000dda4	pushq	%r15
000000000000dda6	pushq	%r14
000000000000dda8	pushq	%rbx
000000000000dda9	pushq	%rax
000000000000ddaa	movl	%edx, %r15d
000000000000ddad	movq	%rsi, %r14
000000000000ddb0	movq	%rdi, %rbx
000000000000ddb3	movq	%rsi, %rdi
000000000000ddb6	callq	0xde1ce                         ## symbol stub for: _CGColorSpaceGetModel
000000000000ddbb	xorl	%ecx, %ecx
000000000000ddbd	cmpl	$0x1, %r15d
000000000000ddc1	sete	%cl
000000000000ddc4	leal	0x2100(,%rcx,4), %ecx
000000000000ddcb	cmpl	$0x2, %r15d
000000000000ddcf	movl	$0x2103, %edx                   ## imm = 0x2103
000000000000ddd4	cmovnel	%ecx, %edx
000000000000ddd7	xorl	%ecx, %ecx
000000000000ddd9	cmpl	$0x2, %eax
000000000000dddc	sete	%cl
000000000000dddf	addl	$0x3, %ecx
000000000000dde2	testl	%eax, %eax
000000000000dde4	movl	$0x1, %eax
000000000000dde9	cmovnel	%ecx, %eax
000000000000ddec	decl	%r15d
000000000000ddef	cmpl	$0x2, %r15d
000000000000ddf3	adcl	$0x0, %eax
000000000000ddf6	shll	$0x5, %eax
000000000000ddf9	movl	$0x20, (%rbx)
000000000000ddff	movl	%eax, 0x4(%rbx)
000000000000de02	movq	%r14, 0x8(%rbx)
000000000000de06	movl	%edx, 0x10(%rbx)
000000000000de09	xorps	%xmm0, %xmm0
000000000000de0c	movups	%xmm0, 0x14(%rbx)
000000000000de10	movq	%rbx, %rax
000000000000de13	addq	$0x8, %rsp
000000000000de17	popq	%rbx
000000000000de18	popq	%r14
000000000000de1a	popq	%r15
000000000000de1c	popq	%rbp
000000000000de1d	retq
