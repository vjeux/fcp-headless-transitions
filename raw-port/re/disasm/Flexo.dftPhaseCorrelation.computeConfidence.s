__ZN19dftPhaseCorrelation17computeConfidenceE22EFFCorrelationDataType:
0000000001224380	pushq	%rbp
0000000001224381	movq	%rsp, %rbp
0000000001224384	pushq	%r15
0000000001224386	pushq	%r14
0000000001224388	pushq	%r13
000000000122438a	pushq	%r12
000000000122438c	pushq	%rbx
000000000122438d	subq	$0x28, %rsp
0000000001224391	movl	0x48(%rdi), %r14d
0000000001224395	testl	%r14d, %r14d
0000000001224398	movq	%rdi, -0x40(%rbp)
000000000122439c	jle	0x12243ea
000000000122439e	movq	0x8(%rdi), %r12
00000000012243a2	leaq	(,%r14,4), %r13
00000000012243aa	movq	%r13, %rdi
00000000012243ad	callq	0x1497446                       ## symbol stub for: __Znam
00000000012243b2	movq	%rax, %rbx
00000000012243b5	movq	%rax, %rdi
00000000012243b8	movq	%r12, %rsi
00000000012243bb	movq	%r13, %rdx
00000000012243be	callq	0x14978ba                       ## symbol stub for: _memcpy
00000000012243c3	movq	%r13, %rdi
00000000012243c6	callq	0x1497446                       ## symbol stub for: __Znam
00000000012243cb	movq	%rax, %r15
00000000012243ce	movq	%rax, %rdi
00000000012243d1	movq	%r12, %rsi
00000000012243d4	movq	%r13, %rdx
00000000012243d7	callq	0x14978ba                       ## symbol stub for: _memcpy
00000000012243dc	leaq	0x45ca08(%rip), %rdi            ## literal pool for: " **** Error:  invalid vector length - median statistics"
00000000012243e3	callq	0x1497b36                       ## symbol stub for: _puts
00000000012243e8	jmp	0x12243ef
00000000012243ea	xorl	%r15d, %r15d
00000000012243ed	xorl	%ebx, %ebx
00000000012243ef	leaq	(%r15,%r14,4), %rsi
00000000012243f3	leaq	-0x29(%rbp), %rdx
00000000012243f7	movq	%r15, %rdi
00000000012243fa	callq	0x14973c2                       ## symbol stub for: __ZNSt3__16__sortIRNS_6__lessIffEEPfEEvT0_S5_T_
00000000012243ff	leal	-0x1(%r14), %eax
0000000001224403	shrl	$0x1f, %eax
0000000001224406	addl	%r14d, %eax
0000000001224409	decl	%eax
000000000122440b	sarl	%eax
000000000122440d	movq	%rax, -0x38(%rbp)
0000000001224411	movss	(%r15,%rax,4), %xmm0
0000000001224417	movl	%r14d, %r13d
000000000122441a	shrl	%r13d
000000000122441d	addss	(%r15,%r13,4), %xmm0
0000000001224423	movaps	%xmm0, -0x50(%rbp)
0000000001224427	movq	%r15, %rdi
000000000122442a	callq	0x14973fe                       ## symbol stub for: __ZdaPv
000000000122442f	testl	%r14d, %r14d
0000000001224432	jle	0x122445d
0000000001224434	leaq	(,%r14,4), %r12
000000000122443c	movq	%r12, %rdi
000000000122443f	callq	0x1497446                       ## symbol stub for: __Znam
0000000001224444	movq	%rax, %r15
0000000001224447	movaps	-0x50(%rbp), %xmm3
000000000122444b	mulss	0x348885(%rip), %xmm3
0000000001224453	cmpl	$0x8, %r14d
0000000001224457	jae	0x1224468
0000000001224459	xorl	%eax, %eax
000000000122445b	jmp	0x12244c0
000000000122445d	xorl	%r12d, %r12d
0000000001224460	xorl	%r15d, %r15d
0000000001224463	jmp	0x122454e
0000000001224468	movl	%r14d, %eax
000000000122446b	andl	$0x7ffffff8, %eax               ## imm = 0x7FFFFFF8
0000000001224470	movaps	%xmm3, %xmm0
0000000001224473	shufps	$0x0, %xmm3, %xmm0              ## xmm0 = xmm0[0,0],xmm3[0,0]
0000000001224477	movl	%r14d, %ecx
000000000122447a	shrl	$0x3, %ecx
000000000122447d	andl	$0xfffffff, %ecx                ## imm = 0xFFFFFFF
0000000001224483	shlq	$0x5, %rcx
0000000001224487	xorl	%edx, %edx
0000000001224489	nopl	(%rax)
0000000001224490	movups	(%rbx,%rdx), %xmm1
0000000001224494	movups	0x10(%rbx,%rdx), %xmm2
0000000001224499	subps	%xmm0, %xmm1
000000000122449c	subps	%xmm0, %xmm2
000000000122449f	movups	%xmm1, (%r15,%rdx)
00000000012244a4	movups	%xmm2, 0x10(%r15,%rdx)
00000000012244aa	addq	$0x20, %rdx
00000000012244ae	cmpq	%rdx, %rcx
00000000012244b1	jne	0x1224490
00000000012244b3	cmpl	%r14d, %eax
00000000012244b6	je	0x12244d7
00000000012244b8	nopl	(%rax,%rax)
00000000012244c0	movss	(%rbx,%rax,4), %xmm0
00000000012244c5	subss	%xmm3, %xmm0
00000000012244c9	movss	%xmm0, (%r15,%rax,4)
00000000012244cf	incq	%rax
00000000012244d2	cmpq	%rax, %r14
00000000012244d5	jne	0x12244c0
00000000012244d7	movq	%r12, %rdi
00000000012244da	callq	0x1497446                       ## symbol stub for: __Znam
00000000012244df	movq	%rax, %r12
00000000012244e2	cmpl	$0x8, %r14d
00000000012244e6	jae	0x12244ec
00000000012244e8	xorl	%eax, %eax
00000000012244ea	jmp	0x122452a
00000000012244ec	movl	%r14d, %eax
00000000012244ef	andl	$0x7ffffff8, %eax               ## imm = 0x7FFFFFF8
00000000012244f4	xorl	%ecx, %ecx
00000000012244f6	movaps	0x3488b3(%rip), %xmm0
00000000012244fd	nopl	(%rax)
0000000001224500	movups	(%r15,%rcx,4), %xmm1
0000000001224505	movups	0x10(%r15,%rcx,4), %xmm2
000000000122450b	andps	%xmm0, %xmm1
000000000122450e	andps	%xmm0, %xmm2
0000000001224511	movups	%xmm1, (%r12,%rcx,4)
0000000001224516	movups	%xmm2, 0x10(%r12,%rcx,4)
000000000122451c	addq	$0x8, %rcx
0000000001224520	cmpq	%rcx, %rax
0000000001224523	jne	0x1224500
0000000001224525	cmpl	%r14d, %eax
0000000001224528	je	0x1224542
000000000122452a	movl	$0x7fffffff, %ecx               ## imm = 0x7FFFFFFF
000000000122452f	nop
0000000001224530	movl	(%r15,%rax,4), %edx
0000000001224534	andl	%ecx, %edx
0000000001224536	movl	%edx, (%r12,%rax,4)
000000000122453a	incq	%rax
000000000122453d	cmpq	%rax, %r14
0000000001224540	jne	0x1224530
0000000001224542	leaq	0x45c8a2(%rip), %rdi            ## literal pool for: " **** Error:  invalid vector length - median statistics"
0000000001224549	callq	0x1497b36                       ## symbol stub for: _puts
000000000122454e	leaq	(%r12,%r14,4), %rsi
0000000001224552	leaq	-0x2a(%rbp), %rdx
0000000001224556	movq	%r12, %rdi
0000000001224559	callq	0x14973c2                       ## symbol stub for: __ZNSt3__16__sortIRNS_6__lessIffEEPfEEvT0_S5_T_
000000000122455e	movq	-0x38(%rbp), %rax
0000000001224562	movss	(%r12,%rax,4), %xmm0
0000000001224568	movss	%xmm0, -0x38(%rbp)
000000000122456d	movss	(%r12,%r13,4), %xmm0
0000000001224573	movss	%xmm0, -0x50(%rbp)
0000000001224578	movq	%r12, %rdi
000000000122457b	callq	0x14973fe                       ## symbol stub for: __ZdaPv
0000000001224580	testq	%r15, %r15
0000000001224583	je	0x122458d
0000000001224585	movq	%r15, %rdi
0000000001224588	callq	0x14973fe                       ## symbol stub for: __ZdaPv
000000000122458d	movq	-0x40(%rbp), %rax
0000000001224591	movss	0x38(%rax), %xmm1
0000000001224596	testq	%rbx, %rbx
0000000001224599	je	0x12245ad
000000000122459b	movq	%rbx, %rdi
000000000122459e	movss	%xmm1, -0x40(%rbp)
00000000012245a3	callq	0x14973fe                       ## symbol stub for: __ZdaPv
00000000012245a8	movss	-0x40(%rbp), %xmm1
00000000012245ad	movss	-0x38(%rbp), %xmm0
00000000012245b2	addss	-0x50(%rbp), %xmm0
00000000012245b7	mulss	0x348719(%rip), %xmm0
00000000012245bf	cvtss2sd	%xmm0, %xmm0
00000000012245c3	mulsd	0x35d355(%rip), %xmm0
00000000012245cb	addsd	%xmm0, %xmm0
00000000012245cf	divsd	0x357571(%rip), %xmm0
00000000012245d7	cvtss2sd	%xmm1, %xmm1
00000000012245db	ucomisd	%xmm0, %xmm1
00000000012245df	ja	0x12245e7
00000000012245e1	xorpd	%xmm0, %xmm0
00000000012245e5	jmp	0x12245ef
00000000012245e7	movss	0x3486e1(%rip), %xmm0
00000000012245ef	addq	$0x28, %rsp
00000000012245f3	popq	%rbx
00000000012245f4	popq	%r12
00000000012245f6	popq	%r13
00000000012245f8	popq	%r14
00000000012245fa	popq	%r15
00000000012245fc	popq	%rbp
00000000012245fd	retq
00000000012245fe	movq	%rax, %r14
0000000001224601	jmp	0x1224651
0000000001224603	movq	%rax, %r14
0000000001224606	testq	%rbx, %rbx
0000000001224609	je	0x1224632
000000000122460b	jmp	0x122465e
000000000122460d	movq	%rax, %r14
0000000001224610	movq	%rbx, %rdi
0000000001224613	callq	0x14973fe                       ## symbol stub for: __ZdaPv
0000000001224618	movq	%r14, %rdi
000000000122461b	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001224620	movq	%rax, %r14
0000000001224623	testq	%r12, %r12
0000000001224626	jne	0x122463a
0000000001224628	testq	%r15, %r15
000000000122462b	jne	0x1224651
000000000122462d	testq	%rbx, %rbx
0000000001224630	jne	0x122465e
0000000001224632	movq	%r14, %rdi
0000000001224635	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000122463a	movq	%r12, %rdi
000000000122463d	callq	0x14973fe                       ## symbol stub for: __ZdaPv
0000000001224642	testq	%r15, %r15
0000000001224645	je	0x122462d
0000000001224647	jmp	0x1224651
0000000001224649	movq	%rax, %r14
000000000122464c	testq	%r15, %r15
000000000122464f	je	0x122462d
0000000001224651	movq	%r15, %rdi
0000000001224654	callq	0x14973fe                       ## symbol stub for: __ZdaPv
0000000001224659	testq	%rbx, %rbx
000000000122465c	je	0x1224632
000000000122465e	movq	%rbx, %rdi
0000000001224661	callq	0x14973fe                       ## symbol stub for: __ZdaPv
0000000001224666	movq	%r14, %rdi
0000000001224669	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000122466e	nop
