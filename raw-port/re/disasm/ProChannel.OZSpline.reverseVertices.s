__ZN8OZSpline15reverseVerticesEPvS0_:
000000000003ccb4	pushq	%rbp
000000000003ccb5	movq	%rsp, %rbp
000000000003ccb8	pushq	%r15
000000000003ccba	pushq	%r14
000000000003ccbc	pushq	%r13
000000000003ccbe	pushq	%r12
000000000003ccc0	pushq	%rbx
000000000003ccc1	subq	$0xf8, %rsp
000000000003ccc8	movq	%rdx, %r12
000000000003cccb	movq	%rsi, %r14
000000000003ccce	movq	%rdi, %rbx
000000000003ccd1	movq	0xa0(%rdi), %rax
000000000003ccd8	testq	%rax, %rax
000000000003ccdb	je	0x3cce6
000000000003ccdd	movq	0x30(%rax), %rdi
000000000003cce1	testq	%rdi, %rdi
000000000003cce4	jne	0x3ccea
000000000003cce6	leaq	0x8(%rbx), %rdi
000000000003ccea	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000003ccef	leaq	-0x50(%rbp), %rax
000000000003ccf3	movq	%rax, (%rax)
000000000003ccf6	movq	%rax, 0x8(%rax)
000000000003ccfa	movq	$0x0, 0x10(%rax)
000000000003cd02	movq	%rbx, %rdi
000000000003cd05	movq	%r14, %rsi
000000000003cd08	callq	__ZN8OZSpline13getVertexIterEPv ## OZSpline::getVertexIter(void*)
000000000003cd0d	movq	%rax, %r15
000000000003cd10	movq	%rbx, %rdi
000000000003cd13	movq	%r12, %rsi
000000000003cd16	callq	__ZN8OZSpline13getVertexIterEPv ## OZSpline::getVertexIter(void*)
000000000003cd1b	movq	%rax, -0x78(%rbp)
000000000003cd1f	addq	$0x8, %rax
000000000003cd23	cmpq	%rax, %r15
000000000003cd26	je	0x3d0b2
000000000003cd2c	movq	0x20(%r14), %rax
000000000003cd30	movq	%rax, -0xb0(%rbp)
000000000003cd37	movups	0x10(%r14), %xmm0
000000000003cd3c	movaps	%xmm0, -0xc0(%rbp)
000000000003cd43	movups	0x10(%r12), %xmm0
000000000003cd49	movaps	%xmm0, -0xa0(%rbp)
000000000003cd50	movq	%r12, -0x80(%rbp)
000000000003cd54	movq	0x20(%r12), %rax
000000000003cd59	movq	%rax, -0x90(%rbp)
000000000003cd60	movq	(%r14), %rax
000000000003cd63	movq	%r14, %rdi
000000000003cd66	callq	*0xd0(%rax)
000000000003cd6c	movl	%eax, %r14d
000000000003cd6f	xorps	%xmm0, %xmm0
000000000003cd72	leaq	-0x70(%rbp), %rax
000000000003cd76	movaps	%xmm0, (%rax)
000000000003cd79	movq	$0x0, 0x10(%rax)
000000000003cd81	xorl	%r12d, %r12d
000000000003cd84	movl	$0x68, %edi
000000000003cd89	callq	0xace4c                         ## symbol stub for: __Znwm
000000000003cd8e	movq	%rax, %r13
000000000003cd91	movq	(%r15), %rsi
000000000003cd94	movq	%rax, %rdi
000000000003cd97	callq	__ZN14OZStaticVertexC1ERKS_     ## OZStaticVertex::OZStaticVertex(OZStaticVertex const&)
000000000003cd9c	testq	%r12, %r12
000000000003cd9f	je	0x3cdee
000000000003cda1	movq	(%r15), %rsi
000000000003cda4	movq	(%rbx), %rax
000000000003cda7	movq	%rbx, %rdi
000000000003cdaa	leaq	-0x38(%rbp), %rdx
000000000003cdae	leaq	-0x30(%rbp), %rcx
000000000003cdb2	movq	0x8d707(%rip), %r8              ## literal pool symbol address: _kCMTimeZero
000000000003cdb9	xorl	%r9d, %r9d
000000000003cdbc	callq	*0x80(%rax)
000000000003cdc2	movsd	-0x38(%rbp), %xmm0
000000000003cdc7	movaps	0x73872(%rip), %xmm2
000000000003cdce	xorps	%xmm2, %xmm0
000000000003cdd1	movsd	-0x30(%rbp), %xmm1
000000000003cdd6	xorps	%xmm2, %xmm1
000000000003cdd9	movq	(%rbx), %rax
000000000003cddc	movq	%rbx, %rdi
000000000003cddf	movq	%r13, %rsi
000000000003cde2	movq	0x8d6d7(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
000000000003cde9	xorl	%ecx, %ecx
000000000003cdeb	callq	*0x78(%rax)
000000000003cdee	cmpq	-0x78(%rbp), %r15
000000000003cdf2	je	0x3ce41
000000000003cdf4	movq	(%r15), %rsi
000000000003cdf7	movq	(%rbx), %rax
000000000003cdfa	movq	%rbx, %rdi
000000000003cdfd	leaq	-0x38(%rbp), %rdx
000000000003ce01	leaq	-0x30(%rbp), %rcx
000000000003ce05	movq	0x8d6b4(%rip), %r8              ## literal pool symbol address: _kCMTimeZero
000000000003ce0c	xorl	%r9d, %r9d
000000000003ce0f	callq	*0x88(%rax)
000000000003ce15	movsd	-0x38(%rbp), %xmm0
000000000003ce1a	movaps	0x7381f(%rip), %xmm2
000000000003ce21	xorps	%xmm2, %xmm0
000000000003ce24	movsd	-0x30(%rbp), %xmm1
000000000003ce29	xorps	%xmm2, %xmm1
000000000003ce2c	movq	(%rbx), %rax
000000000003ce2f	movq	%rbx, %rdi
000000000003ce32	movq	%r13, %rsi
000000000003ce35	movq	0x8d684(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
000000000003ce3c	xorl	%ecx, %ecx
000000000003ce3e	callq	*0x70(%rax)
000000000003ce41	movq	(%r15), %rax
000000000003ce44	movq	-0xb0(%rbp), %rcx
000000000003ce4b	movq	%rcx, 0x28(%rsp)
000000000003ce50	movaps	-0xc0(%rbp), %xmm0
000000000003ce57	movups	%xmm0, 0x18(%rsp)
000000000003ce5c	movq	0x20(%rax), %rcx
000000000003ce60	movq	%rcx, 0x10(%rsp)
000000000003ce65	movups	0x10(%rax), %xmm0
000000000003ce69	movups	%xmm0, (%rsp)
000000000003ce6d	leaq	-0xf0(%rbp), %rdi
000000000003ce74	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
000000000003ce79	movq	-0xe0(%rbp), %rax
000000000003ce80	movq	%rax, 0x28(%rsp)
000000000003ce85	movups	-0xf0(%rbp), %xmm0
000000000003ce8c	movups	%xmm0, 0x18(%rsp)
000000000003ce91	movq	-0x90(%rbp), %rax
000000000003ce98	movq	%rax, 0x10(%rsp)
000000000003ce9d	movaps	-0xa0(%rbp), %xmm0
000000000003cea4	movups	%xmm0, (%rsp)
000000000003cea8	leaq	-0xd8(%rbp), %rdi
000000000003ceaf	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
000000000003ceb4	movq	(%r13), %rax
000000000003ceb8	movq	%r13, %rdi
000000000003cebb	leaq	-0xd8(%rbp), %rsi
000000000003cec2	callq	*0x10(%rax)
000000000003cec5	testq	%r12, %r12
000000000003cec8	jne	0x3ceda
000000000003ceca	movq	-0x80(%rbp), %rdi
000000000003cece	movq	(%rdi), %rax
000000000003ced1	callq	*0xd0(%rax)
000000000003ced7	movl	%eax, %r14d
000000000003ceda	movq	(%r13), %rax
000000000003cede	movq	%r13, %rdi
000000000003cee1	movl	%r14d, %esi
000000000003cee4	callq	*0xc8(%rax)
000000000003ceea	movq	(%r15), %rdi
000000000003ceed	movq	(%rdi), %rax
000000000003cef0	callq	*0xd0(%rax)
000000000003cef6	movl	%eax, %r14d
000000000003cef9	movl	$0x18, %edi
000000000003cefe	callq	0xace4c                         ## symbol stub for: __Znwm
000000000003cf03	movq	%r13, 0x10(%rax)
000000000003cf07	leaq	-0x50(%rbp), %rcx
000000000003cf0b	movq	%rcx, (%rax)
000000000003cf0e	movq	-0x48(%rbp), %rcx
000000000003cf12	movq	%rcx, 0x8(%rax)
000000000003cf16	movq	%rax, (%rcx)
000000000003cf19	movq	%rax, -0x48(%rbp)
000000000003cf1d	incq	-0x40(%rbp)
000000000003cf21	movq	(%r15), %rax
000000000003cf24	movq	%rax, -0xd8(%rbp)
000000000003cf2b	leaq	-0x70(%rbp), %rdi
000000000003cf2f	leaq	-0xd8(%rbp), %rsi
000000000003cf36	callq	__ZNSt3__16vectorIPvNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<void*, std::__1::allocator<void*>>::push_back[abi:nqe210106](void* const&)
000000000003cf3b	addq	$-0x8, %r12
000000000003cf3f	cmpq	-0x78(%rbp), %r15
000000000003cf43	leaq	0x8(%r15), %r15
000000000003cf47	jne	0x3cd84
000000000003cf4d	movq	0xa0(%rbx), %rax
000000000003cf54	testq	%rax, %rax
000000000003cf57	leaq	-0x50(%rbp), %r12
000000000003cf5b	je	0x3cf66
000000000003cf5d	movq	0x30(%rax), %rdi
000000000003cf61	testq	%rdi, %rdi
000000000003cf64	jne	0x3cf6a
000000000003cf66	leaq	0x8(%rbx), %rdi
000000000003cf6a	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000003cf6f	movq	-0x70(%rbp), %rax
000000000003cf73	cmpq	%rax, -0x68(%rbp)
000000000003cf77	je	0x3cfb4
000000000003cf79	movl	$0x1, %r15d
000000000003cf7f	xorl	%ecx, %ecx
000000000003cf81	movq	0x8d538(%rip), %r14             ## literal pool symbol address: _kCMTimeZero
000000000003cf88	movq	(%rax,%rcx,8), %rsi
000000000003cf8c	movq	(%rbx), %rax
000000000003cf8f	movq	%rbx, %rdi
000000000003cf92	xorl	%edx, %edx
000000000003cf94	movq	%r14, %rcx
000000000003cf97	callq	*0x20(%rax)
000000000003cf9a	movl	%r15d, %ecx
000000000003cf9d	movq	-0x70(%rbp), %rax
000000000003cfa1	movq	-0x68(%rbp), %rdx
000000000003cfa5	subq	%rax, %rdx
000000000003cfa8	sarq	$0x3, %rdx
000000000003cfac	incl	%r15d
000000000003cfaf	cmpq	%rcx, %rdx
000000000003cfb2	ja	0x3cf88
000000000003cfb4	movq	0xa0(%rbx), %rax
000000000003cfbb	testq	%rax, %rax
000000000003cfbe	je	0x3cfc9
000000000003cfc0	movq	0x30(%rax), %rdi
000000000003cfc4	testq	%rdi, %rdi
000000000003cfc7	jne	0x3cfcd
000000000003cfc9	leaq	0x8(%rbx), %rdi
000000000003cfcd	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000003cfd2	movq	0x10(%rbx), %r14
000000000003cfd6	cmpq	%r12, -0x48(%rbp)
000000000003cfda	je	0x3d050
000000000003cfdc	cmpq	0x18(%rbx), %r14
000000000003cfe0	je	0x3d01f
000000000003cfe2	movq	(%r14), %rax
000000000003cfe5	movq	-0x48(%rbp), %rcx
000000000003cfe9	movq	0x10(%rcx), %rcx
000000000003cfed	movq	0x20(%rcx), %rdx
000000000003cff1	movq	%rdx, 0x28(%rsp)
000000000003cff6	movups	0x10(%rcx), %xmm0
000000000003cffa	movups	%xmm0, 0x18(%rsp)
000000000003cfff	movq	0x20(%rax), %rcx
000000000003d003	movq	%rcx, 0x10(%rsp)
000000000003d008	movups	0x10(%rax), %xmm0
000000000003d00c	movups	%xmm0, (%rsp)
000000000003d010	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000003d015	testl	%eax, %eax
000000000003d017	jns	0x3d01f
000000000003d019	addq	$0x8, %r14
000000000003d01d	jmp	0x3cfdc
000000000003d01f	leaq	0x10(%rbx), %r15
000000000003d023	movq	-0x48(%rbp), %rdx
000000000003d027	xorl	%r8d, %r8d
000000000003d02a	cmpq	%r12, %rdx
000000000003d02d	je	0x3d03e
000000000003d02f	movq	%rdx, %rax
000000000003d032	incq	%r8
000000000003d035	movq	0x8(%rax), %rax
000000000003d039	cmpq	%r12, %rax
000000000003d03c	jne	0x3d032
000000000003d03e	leaq	-0x50(%rbp), %rcx
000000000003d042	movq	%r15, %rdi
000000000003d045	movq	%r14, %rsi
000000000003d048	callq	__ZNSt3__16vectorIP8OZVertexNS_9allocatorIS2_EEE18__insert_with_sizeB9nqe210106INS_15__list_iteratorIP14OZStaticVertexPvEESB_EENS_11__wrap_iterIPS2_EENSC_IPKS2_EET_T0_l ## std::__1::__wrap_iter<OZVertex**> std::__1::vector<OZVertex*, std::__1::allocator<OZVertex*>>::__insert_with_size[abi:nqe210106]<std::__1::__list_iterator<OZStaticVertex*, void*>, std::__1::__list_iterator<OZStaticVertex*, void*>>(std::__1::__wrap_iter<OZVertex* const*>, std::__1::__list_iterator<OZStaticVertex*, void*>, std::__1::__list_iterator<OZStaticVertex*, void*>, long)
000000000003d04d	movq	(%r15), %r14
000000000003d050	movb	$0x1, 0x91(%rbx)
000000000003d057	movq	%r14, 0x28(%rbx)
000000000003d05b	movq	0x18(%rbx), %rax
000000000003d05f	movq	%rax, 0x30(%rbx)
000000000003d063	xorps	%xmm0, %xmm0
000000000003d066	movups	%xmm0, 0x78(%rbx)
000000000003d06a	movq	$0x0, 0x88(%rbx)
000000000003d075	movq	%rbx, %rdi
000000000003d078	callq	__ZN8OZSpline24refreshValidVerticesListEv ## OZSpline::refreshValidVerticesList()
000000000003d07d	movq	0xa0(%rbx), %rax
000000000003d084	testq	%rax, %rax
000000000003d087	je	0x3d092
000000000003d089	movq	0x30(%rax), %rdi
000000000003d08d	testq	%rdi, %rdi
000000000003d090	jne	0x3d099
000000000003d092	addq	$0x8, %rbx
000000000003d096	movq	%rbx, %rdi
000000000003d099	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000003d09e	movq	-0x70(%rbp), %rdi
000000000003d0a2	testq	%rdi, %rdi
000000000003d0a5	je	0x3d0d3
000000000003d0a7	movq	%rdi, -0x68(%rbp)
000000000003d0ab	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000003d0b0	jmp	0x3d0d3
000000000003d0b2	movq	0xa0(%rbx), %rax
000000000003d0b9	testq	%rax, %rax
000000000003d0bc	je	0x3d0c7
000000000003d0be	movq	0x30(%rax), %rdi
000000000003d0c2	testq	%rdi, %rdi
000000000003d0c5	jne	0x3d0ce
000000000003d0c7	addq	$0x8, %rbx
000000000003d0cb	movq	%rbx, %rdi
000000000003d0ce	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000003d0d3	leaq	-0x50(%rbp), %rdi
000000000003d0d7	callq	__ZNSt3__110__list_impIP14OZStaticVertexNS_9allocatorIS2_EEE5clearEv ## std::__1::__list_imp<OZStaticVertex*, std::__1::allocator<OZStaticVertex*>>::clear()
000000000003d0dc	addq	$0xf8, %rsp
000000000003d0e3	popq	%rbx
000000000003d0e4	popq	%r12
000000000003d0e6	popq	%r13
000000000003d0e8	popq	%r14
000000000003d0ea	popq	%r15
000000000003d0ec	popq	%rbp
000000000003d0ed	retq
000000000003d0ee	jmp	0x3d0f0
000000000003d0f0	movq	%rax, %rbx
000000000003d0f3	jmp	0x3d123
000000000003d0f5	jmp	0x3d10e
000000000003d0f7	jmp	0x3d10e
000000000003d0f9	jmp	0x3d10e
000000000003d0fb	jmp	0x3d10e
000000000003d0fd	movq	%rax, %rbx
000000000003d100	movq	%r13, %rdi
000000000003d103	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000003d108	jmp	0x3d111
000000000003d10a	jmp	0x3d10e
000000000003d10c	jmp	0x3d10e
000000000003d10e	movq	%rax, %rbx
000000000003d111	movq	-0x70(%rbp), %rdi
000000000003d115	testq	%rdi, %rdi
000000000003d118	je	0x3d123
000000000003d11a	movq	%rdi, -0x68(%rbp)
000000000003d11e	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000003d123	leaq	-0x50(%rbp), %rdi
000000000003d127	callq	__ZNSt3__110__list_impIP14OZStaticVertexNS_9allocatorIS2_EEE5clearEv ## std::__1::__list_imp<OZStaticVertex*, std::__1::allocator<OZStaticVertex*>>::clear()
000000000003d12c	movq	%rbx, %rdi
000000000003d12f	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
