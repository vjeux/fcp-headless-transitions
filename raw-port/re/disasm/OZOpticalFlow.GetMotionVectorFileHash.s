__ZN13OZOpticalFlow23GetMotionVectorFileHashEPK9OZFootage:
00000000004ecae0	pushq	%rbp
00000000004ecae1	movq	%rsp, %rbp
00000000004ecae4	pushq	%r14
00000000004ecae6	pushq	%rbx
00000000004ecae7	movl	$0x10c0, %eax                   ## imm = 0x10C0
00000000004ecaec	callq	0x6dfcb4                        ## symbol stub for: ____chkstk_darwin
00000000004ecaf1	subq	%rax, %rsp
00000000004ecaf4	movq	%rsi, %r14
00000000004ecaf7	movq	%rdi, %rbx
00000000004ecafa	movq	0x339937(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000004ecb01	movq	(%rax), %rax
00000000004ecb04	movq	%rax, -0x18(%rbp)
00000000004ecb08	movq	(%rsi), %rax
00000000004ecb0b	leaq	-0x1058(%rbp), %rdi
00000000004ecb12	callq	*0x518(%rax)
00000000004ecb18	leaq	-0x1068(%rbp), %rdi
00000000004ecb1f	leaq	-0x1058(%rbp), %rsi
00000000004ecb26	callq	__ZN12_GLOBAL__N_117GetBaseClipStringERK8PCString ## (anonymous namespace)::GetBaseClipString(PCString const&)
00000000004ecb2b	leaq	-0x1058(%rbp), %rdi
00000000004ecb32	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004ecb37	leaq	-0x1058(%rbp), %rdi
00000000004ecb3e	callq	0x6de3b2                        ## symbol stub for: __ZN17PCHashWriteStreamC1Ev
00000000004ecb43	leaq	-0x1058(%rbp), %rdi
00000000004ecb4a	leaq	-0x1068(%rbp), %rsi
00000000004ecb51	callq	0x6de36a                        ## symbol stub for: __ZN17PCHashWriteStream10writeValueERK8PCString
00000000004ecb56	leaq	-0x1078(%rbp), %rdi
00000000004ecb5d	callq	0x6df4b0                        ## symbol stub for: __ZN9PCHash128C1Ev
00000000004ecb62	leaq	-0x1078(%rbp), %rsi
00000000004ecb69	movq	%r14, %rdi
00000000004ecb6c	callq	__ZNK9OZFootage21getHashForOpticalFlowER9PCHash128 ## OZFootage::getHashForOpticalFlow(PCHash128&) const
00000000004ecb71	movl	-0x1078(%rbp), %esi
00000000004ecb77	leaq	-0x1058(%rbp), %rdi
00000000004ecb7e	callq	0x6de38e                        ## symbol stub for: __ZN17PCHashWriteStream10writeValueEj
00000000004ecb83	movl	-0x1074(%rbp), %esi
00000000004ecb89	leaq	-0x1058(%rbp), %rdi
00000000004ecb90	callq	0x6de38e                        ## symbol stub for: __ZN17PCHashWriteStream10writeValueEj
00000000004ecb95	movl	-0x1070(%rbp), %esi
00000000004ecb9b	leaq	-0x1058(%rbp), %rdi
00000000004ecba2	callq	0x6de38e                        ## symbol stub for: __ZN17PCHashWriteStream10writeValueEj
00000000004ecba7	movl	-0x106c(%rbp), %esi
00000000004ecbad	leaq	-0x1058(%rbp), %rdi
00000000004ecbb4	callq	0x6de38e                        ## symbol stub for: __ZN17PCHashWriteStream10writeValueEj
00000000004ecbb9	movl	$0xd5, 0x50(%rsp)
00000000004ecbc1	movl	$0x89, 0x48(%rsp)
00000000004ecbc9	movl	$0x5e, 0x40(%rsp)
00000000004ecbd1	movl	$0xff, 0x38(%rsp)
00000000004ecbd9	movl	$0x80, 0x30(%rsp)
00000000004ecbe1	movl	$0xbf, 0x28(%rsp)
00000000004ecbe9	movl	$0x10, 0x20(%rsp)
00000000004ecbf1	movl	$0xa4, 0x18(%rsp)
00000000004ecbf9	movl	$0x47, 0x10(%rsp)
00000000004ecc01	movl	$0x4c, 0x8(%rsp)
00000000004ecc09	movl	$0x34, (%rsp)
00000000004ecc10	xorl	%edi, %edi
00000000004ecc12	movl	$0xfa, %esi
00000000004ecc17	movl	$0x24, %edx
00000000004ecc1c	movl	$0xc3, %ecx
00000000004ecc21	movl	$0x71, %r8d
00000000004ecc27	movl	$0xe0, %r9d
00000000004ecc2d	callq	0x6dc8d0                        ## symbol stub for: _CFUUIDGetConstantUUIDWithBytes
00000000004ecc32	xorl	%edi, %edi
00000000004ecc34	movq	%rax, %rsi
00000000004ecc37	callq	0x6dc8ca                        ## symbol stub for: _CFUUIDCreateString
00000000004ecc3c	movq	%rax, %r14
00000000004ecc3f	leaq	-0x1060(%rbp), %rdi
00000000004ecc46	movq	%rax, %rsi
00000000004ecc49	callq	0x6df084                        ## symbol stub for: __ZN8PCStringC1EPK10__CFString
00000000004ecc4e	leaq	-0x1058(%rbp), %rdi
00000000004ecc55	leaq	-0x1060(%rbp), %rsi
00000000004ecc5c	callq	0x6de36a                        ## symbol stub for: __ZN17PCHashWriteStream10writeValueERK8PCString
00000000004ecc61	movq	%r14, %rdi
00000000004ecc64	callq	0x6dc810                        ## symbol stub for: _CFRelease
00000000004ecc69	leaq	-0x1058(%rbp), %rdi
00000000004ecc70	callq	0x6de3a6                        ## symbol stub for: __ZN17PCHashWriteStream7getHashEv
00000000004ecc75	movups	(%rax), %xmm0
00000000004ecc78	movups	%xmm0, (%rbx)
00000000004ecc7b	leaq	-0x1060(%rbp), %rdi
00000000004ecc82	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004ecc87	leaq	-0x1058(%rbp), %rdi
00000000004ecc8e	callq	0x6de3b8                        ## symbol stub for: __ZN17PCHashWriteStreamD1Ev
00000000004ecc93	leaq	-0x1068(%rbp), %rdi
00000000004ecc9a	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004ecc9f	movq	0x339792(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000004ecca6	movq	(%rax), %rax
00000000004ecca9	cmpq	-0x18(%rbp), %rax
00000000004eccad	jne	0x4eccbe
00000000004eccaf	movq	%rbx, %rax
00000000004eccb2	addq	$0x10c0, %rsp                   ## imm = 0x10C0
00000000004eccb9	popq	%rbx
00000000004eccba	popq	%r14
00000000004eccbc	popq	%rbp
00000000004eccbd	retq
00000000004eccbe	callq	0x6dfd38                        ## symbol stub for: ___stack_chk_fail
00000000004eccc3	jmp	0x4ecd10
00000000004eccc5	jmp	0x4ecd10
00000000004eccc7	movq	%rax, %rbx
00000000004eccca	leaq	-0x1068(%rbp), %rdi
00000000004eccd1	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004eccd6	movq	%rbx, %rdi
00000000004eccd9	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004eccde	movq	%rax, %rbx
00000000004ecce1	leaq	-0x1058(%rbp), %rdi
00000000004ecce8	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004ecced	movq	%rbx, %rdi
00000000004eccf0	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004eccf5	movq	%rax, %rdi
00000000004eccf8	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004eccfd	jmp	0x4ecd10
00000000004eccff	movq	%rax, %rbx
00000000004ecd02	leaq	-0x1060(%rbp), %rdi
00000000004ecd09	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004ecd0e	jmp	0x4ecd13
00000000004ecd10	movq	%rax, %rbx
00000000004ecd13	leaq	-0x1058(%rbp), %rdi
00000000004ecd1a	callq	0x6de3b8                        ## symbol stub for: __ZN17PCHashWriteStreamD1Ev
00000000004ecd1f	leaq	-0x1068(%rbp), %rdi
00000000004ecd26	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004ecd2b	movq	%rbx, %rdi
00000000004ecd2e	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004ecd33	nopw	%cs:(%rax,%rax)
