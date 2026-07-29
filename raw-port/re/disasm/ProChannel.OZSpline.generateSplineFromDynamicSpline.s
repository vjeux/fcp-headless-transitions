__ZN8OZSpline31generateSplineFromDynamicSplineERK6CMTimeP15OZDynamicSpline:
000000000003da9c	pushq	%rbp
000000000003da9d	movq	%rsp, %rbp
000000000003daa0	pushq	%r15
000000000003daa2	pushq	%r14
000000000003daa4	pushq	%r13
000000000003daa6	pushq	%r12
000000000003daa8	pushq	%rbx
000000000003daa9	subq	$0x18, %rsp
000000000003daad	movq	%rdx, -0x38(%rbp)
000000000003dab1	movq	%rsi, %r15
000000000003dab4	movq	%rdi, %rbx
000000000003dab7	movq	$0x0, -0x30(%rbp)
000000000003dabf	callq	__ZN8OZSpline17deleteAllVerticesEv ## OZSpline::deleteAllVertices()
000000000003dac4	movq	0xa0(%rbx), %rax
000000000003dacb	testq	%rax, %rax
000000000003dace	je	0x3dad9
000000000003dad0	movq	0x30(%rax), %rdi
000000000003dad4	testq	%rdi, %rdi
000000000003dad7	jne	0x3dadd
000000000003dad9	leaq	0x8(%rbx), %rdi
000000000003dadd	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000003dae2	leaq	0x10(%rbx), %r12
000000000003dae6	movq	-0x38(%rbp), %r14
000000000003daea	movq	%r14, %rdi
000000000003daed	movq	%r15, %rsi
000000000003daf0	callq	__ZN8OZSpline24getNumberOfValidVerticesERK6CMTime ## OZSpline::getNumberOfValidVertices(CMTime const&)
000000000003daf5	movl	%eax, %esi
000000000003daf7	movq	%r12, %rdi
000000000003dafa	callq	__ZNSt3__16vectorIP8OZVertexNS_9allocatorIS2_EEE7reserveEm ## std::__1::vector<OZVertex*, std::__1::allocator<OZVertex*>>::reserve(unsigned long)
000000000003daff	leaq	-0x30(%rbp), %rsi
000000000003db03	movq	%r14, %rdi
000000000003db06	movq	%r15, %rdx
000000000003db09	callq	__ZN8OZSpline19getFirstValidVertexEPPvRK6CMTime ## OZSpline::getFirstValidVertex(void**, CMTime const&)
000000000003db0e	testb	%al, %al
000000000003db10	je	0x3db97
000000000003db16	movq	-0x30(%rbp), %r14
000000000003db1a	movl	$0x68, %edi
000000000003db1f	callq	0xace4c                         ## symbol stub for: __Znwm
000000000003db24	movq	%rax, %r13
000000000003db27	movq	%rax, %rdi
000000000003db2a	movq	%r14, %rsi
000000000003db2d	movq	%r15, %rdx
000000000003db30	callq	__ZN14OZStaticVertexC1EP15OZDynamicVertexRK6CMTime ## OZStaticVertex::OZStaticVertex(OZDynamicVertex*, CMTime const&)
000000000003db35	leaq	-0x40(%rbp), %rsi
000000000003db39	movq	%r13, (%rsi)
000000000003db3c	movq	%r12, %rdi
000000000003db3f	callq	__ZNSt3__16vectorIP8OZVertexNS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<OZVertex*, std::__1::allocator<OZVertex*>>::push_back[abi:nqe210106](OZVertex* const&)
000000000003db44	leaq	-0x30(%rbp), %rdx
000000000003db48	movq	-0x38(%rbp), %rdi
000000000003db4c	movq	%r14, %rsi
000000000003db4f	movq	%r15, %rcx
000000000003db52	callq	__ZN8OZSpline18getNextValidVertexEPvPS0_RK6CMTime ## OZSpline::getNextValidVertex(void*, void**, CMTime const&)
000000000003db57	testb	%al, %al
000000000003db59	je	0x3db97
000000000003db5b	movq	-0x30(%rbp), %r14
000000000003db5f	movl	$0x68, %edi
000000000003db64	callq	0xace4c                         ## symbol stub for: __Znwm
000000000003db69	movq	%rax, %r13
000000000003db6c	movq	%rax, %rdi
000000000003db6f	movq	%r14, %rsi
000000000003db72	movq	%r15, %rdx
000000000003db75	callq	__ZN14OZStaticVertexC1EP15OZDynamicVertexRK6CMTime ## OZStaticVertex::OZStaticVertex(OZDynamicVertex*, CMTime const&)
000000000003db7a	movq	%r13, -0x40(%rbp)
000000000003db7e	movq	%r12, %rdi
000000000003db81	leaq	-0x40(%rbp), %rsi
000000000003db85	callq	__ZNSt3__16vectorIP8OZVertexNS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<OZVertex*, std::__1::allocator<OZVertex*>>::push_back[abi:nqe210106](OZVertex* const&)
000000000003db8a	movq	-0x38(%rbp), %rdi
000000000003db8e	movq	%r14, %rsi
000000000003db91	leaq	-0x30(%rbp), %rdx
000000000003db95	jmp	0x3db4f
000000000003db97	movb	$0x1, 0x91(%rbx)
000000000003db9e	movups	0x10(%rbx), %xmm0
000000000003dba2	movups	%xmm0, 0x28(%rbx)
000000000003dba6	xorps	%xmm0, %xmm0
000000000003dba9	movups	%xmm0, 0x78(%rbx)
000000000003dbad	movq	$0x0, 0x88(%rbx)
000000000003dbb8	movq	%rbx, %rdi
000000000003dbbb	callq	__ZN8OZSpline24refreshValidVerticesListEv ## OZSpline::refreshValidVerticesList()
000000000003dbc0	movq	-0x38(%rbp), %rax
000000000003dbc4	movb	0x90(%rax), %al
000000000003dbca	movb	%al, 0x90(%rbx)
000000000003dbd0	movq	0xa0(%rbx), %rax
000000000003dbd7	testq	%rax, %rax
000000000003dbda	je	0x3dbe5
000000000003dbdc	movq	0x30(%rax), %rdi
000000000003dbe0	testq	%rdi, %rdi
000000000003dbe3	jne	0x3dbec
000000000003dbe5	addq	$0x8, %rbx
000000000003dbe9	movq	%rbx, %rdi
000000000003dbec	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000003dbf1	addq	$0x18, %rsp
000000000003dbf5	popq	%rbx
000000000003dbf6	popq	%r12
000000000003dbf8	popq	%r13
000000000003dbfa	popq	%r14
000000000003dbfc	popq	%r15
000000000003dbfe	popq	%rbp
000000000003dbff	retq
000000000003dc00	jmp	0x3dc02
000000000003dc02	movq	%rax, %rbx
000000000003dc05	movq	%r13, %rdi
000000000003dc08	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000003dc0d	movq	%rbx, %rdi
000000000003dc10	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000003dc15	nop
