__ZN24IntermediateLargeInteger10makeCMTimeES_S_bb:
00000000000be59e	pushq	%rbp
00000000000be59f	movq	%rsp, %rbp
00000000000be5a2	pushq	%r15
00000000000be5a4	pushq	%r14
00000000000be5a6	pushq	%r13
00000000000be5a8	pushq	%r12
00000000000be5aa	pushq	%rbx
00000000000be5ab	subq	$0xc8, %rsp
00000000000be5b2	movl	%ecx, %r12d
00000000000be5b5	movq	%rdx, %r14
00000000000be5b8	movq	%rsi, %r15
00000000000be5bb	movq	%rdi, %rbx
00000000000be5be	testl	%r8d, %r8d
00000000000be5c1	jne	0xbe617
00000000000be5c3	movq	(%r15), %rsi
00000000000be5c6	movq	0x8(%r15), %rax
00000000000be5ca	testq	%rsi, %rsi
00000000000be5cd	js	0xbe5df
00000000000be5cf	testq	%rax, %rax
00000000000be5d2	jne	0xbe617
00000000000be5d4	cmpq	$0x0, 0x10(%r15)
00000000000be5d9	jne	0xbe617
00000000000be5db	xorl	%eax, %eax
00000000000be5dd	jmp	0xbe5f3
00000000000be5df	cmpq	$-0x1, %rax
00000000000be5e3	jne	0xbe617
00000000000be5e5	cmpq	$-0x1, 0x10(%r15)
00000000000be5ea	jne	0xbe617
00000000000be5ec	movq	$-0x1, %rax
00000000000be5f3	cmpq	%rax, 0x18(%r15)
00000000000be5f7	jne	0xbe617
00000000000be5f9	movq	(%r14), %rdx
00000000000be5fc	movq	%rdx, %rax
00000000000be5ff	shrq	$0x20, %rax
00000000000be603	jne	0xbe617
00000000000be605	cmpq	$0x0, 0x8(%r14)
00000000000be60a	jne	0xbe617
00000000000be60c	cmpq	$0x0, 0x18(%r14)
00000000000be611	je	0xbec04
00000000000be617	movq	%r14, %rdi
00000000000be61a	xorl	%esi, %esi
00000000000be61c	callq	__ZNK24IntermediateLargeIntegereqEx ## IntermediateLargeInteger::operator==(long long) const
00000000000be621	testb	%al, %al
00000000000be623	je	0xbe63f
00000000000be625	movq	0x891bc(%rip), %rax             ## literal pool symbol address: _kCMTimeInvalid
00000000000be62c	movq	0x10(%rax), %rcx
00000000000be630	movq	%rcx, 0x10(%rbx)
00000000000be634	movups	(%rax), %xmm0
00000000000be637	movups	%xmm0, (%rbx)
00000000000be63a	jmp	0xbebef
00000000000be63f	movl	%r12d, -0x54(%rbp)
00000000000be643	leaq	-0xc0(%rbp), %rsi
00000000000be64a	xorl	%edi, %edi
00000000000be64c	callq	_bignum_s256_init_from_s64
00000000000be651	movq	0x18(%r15), %r12
00000000000be655	movq	%r12, %rax
00000000000be658	shrq	$0x3f, %rax
00000000000be65c	movq	%rax, -0x80(%rbp)
00000000000be660	testq	%r12, %r12
00000000000be663	jns	0xbe698
00000000000be665	leaq	-0x78(%rbp), %r13
00000000000be669	xorl	%edi, %edi
00000000000be66b	movq	%r13, %rsi
00000000000be66e	callq	_bignum_s256_init_from_s64
00000000000be673	leaq	-0xc0(%rbp), %rdi
00000000000be67a	movq	%r15, %rsi
00000000000be67d	movq	%r13, %rdx
00000000000be680	callq	_bignum_s256_sub
00000000000be685	movups	(%r13), %xmm0
00000000000be68a	movups	0x10(%r13), %xmm1
00000000000be68f	movups	%xmm1, 0x10(%r15)
00000000000be694	movups	%xmm0, (%r15)
00000000000be698	cmpq	$0x0, 0x18(%r14)
00000000000be69d	jns	0xbe6dc
00000000000be69f	testq	%r12, %r12
00000000000be6a2	setns	%al
00000000000be6a5	movq	%rax, -0x80(%rbp)
00000000000be6a9	leaq	-0x78(%rbp), %r13
00000000000be6ad	xorl	%edi, %edi
00000000000be6af	movq	%r13, %rsi
00000000000be6b2	callq	_bignum_s256_init_from_s64
00000000000be6b7	leaq	-0xc0(%rbp), %rdi
00000000000be6be	movq	%r14, %rsi
00000000000be6c1	movq	%r13, %rdx
00000000000be6c4	callq	_bignum_s256_sub
00000000000be6c9	movups	(%r13), %xmm0
00000000000be6ce	movups	0x10(%r13), %xmm1
00000000000be6d3	movups	%xmm1, 0x10(%r14)
00000000000be6d8	movups	%xmm0, (%r14)
00000000000be6dc	movups	(%r15), %xmm0
00000000000be6e0	movups	0x10(%r15), %xmm1
00000000000be6e5	leaq	-0x50(%rbp), %rsi
00000000000be6e9	movaps	%xmm1, 0x10(%rsi)
00000000000be6ed	movaps	%xmm0, (%rsi)
00000000000be6f0	movups	(%r14), %xmm0
00000000000be6f4	movups	0x10(%r14), %xmm1
00000000000be6f9	leaq	-0xa0(%rbp), %rdx
00000000000be700	movaps	%xmm1, 0x10(%rdx)
00000000000be704	movaps	%xmm0, (%rdx)
00000000000be707	leaq	-0x78(%rbp), %r13
00000000000be70b	movq	%r13, %rdi
00000000000be70e	callq	__ZN24IntermediateLargeInteger3gcdES_S_ ## IntermediateLargeInteger::gcd(IntermediateLargeInteger, IntermediateLargeInteger)
00000000000be713	movq	(%r13), %rcx
00000000000be717	movq	0x8(%r13), %rdx
00000000000be71b	testq	%rcx, %rcx
00000000000be71e	movl	-0x54(%rbp), %r12d
00000000000be722	js	0xbe73e
00000000000be724	movq	-0x68(%rbp), %rax
00000000000be728	orq	%rdx, %rax
00000000000be72b	jne	0xbe73e
00000000000be72d	cmpq	$0x1, %rcx
00000000000be731	jne	0xbe73e
00000000000be733	cmpq	$0x0, -0x60(%rbp)
00000000000be738	je	0xbe888
00000000000be73e	movq	(%r15), %rax
00000000000be741	movq	0x8(%r15), %rsi
00000000000be745	testq	%rax, %rax
00000000000be748	js	0xbe75a
00000000000be74a	testq	%rsi, %rsi
00000000000be74d	jne	0xbe7af
00000000000be74f	cmpq	$0x0, 0x10(%r15)
00000000000be754	jne	0xbe7af
00000000000be756	xorl	%esi, %esi
00000000000be758	jmp	0xbe76e
00000000000be75a	cmpq	$-0x1, %rsi
00000000000be75e	jne	0xbe7af
00000000000be760	cmpq	$-0x1, 0x10(%r15)
00000000000be765	jne	0xbe7af
00000000000be767	movq	$-0x1, %rsi
00000000000be76e	cmpq	%rsi, 0x18(%r15)
00000000000be772	jne	0xbe7af
00000000000be774	movq	-0x68(%rbp), %rsi
00000000000be778	testq	%rcx, %rcx
00000000000be77b	js	0xbe786
00000000000be77d	orq	%rsi, %rdx
00000000000be780	jne	0xbe7af
00000000000be782	xorl	%esi, %esi
00000000000be784	jmp	0xbe796
00000000000be786	andq	%rsi, %rdx
00000000000be789	movq	$-0x1, %rsi
00000000000be790	cmpq	$-0x1, %rdx
00000000000be794	jne	0xbe7af
00000000000be796	cmpq	%rsi, -0x60(%rbp)
00000000000be79a	jne	0xbe7af
00000000000be79c	cqto
00000000000be79e	idivq	%rcx
00000000000be7a1	leaq	-0x50(%rbp), %rsi
00000000000be7a5	movq	%rax, %rdi
00000000000be7a8	callq	_bignum_s256_init_from_s64
00000000000be7ad	jmp	0xbe7ce
00000000000be7af	leaq	-0x50(%rbp), %r13
00000000000be7b3	xorl	%edi, %edi
00000000000be7b5	movq	%r13, %rsi
00000000000be7b8	callq	_bignum_s256_init_from_s64
00000000000be7bd	leaq	-0x78(%rbp), %rsi
00000000000be7c1	movq	%r15, %rdi
00000000000be7c4	movq	%r13, %rdx
00000000000be7c7	xorl	%ecx, %ecx
00000000000be7c9	callq	_bignum_s256_divide
00000000000be7ce	movups	-0x50(%rbp), %xmm0
00000000000be7d2	movups	-0x40(%rbp), %xmm1
00000000000be7d6	movups	%xmm1, 0x10(%r15)
00000000000be7db	movups	%xmm0, (%r15)
00000000000be7df	movq	(%r14), %rax
00000000000be7e2	movq	0x8(%r14), %rcx
00000000000be7e6	testq	%rax, %rax
00000000000be7e9	js	0xbe7fb
00000000000be7eb	testq	%rcx, %rcx
00000000000be7ee	jne	0xbe858
00000000000be7f0	cmpq	$0x0, 0x10(%r14)
00000000000be7f5	jne	0xbe858
00000000000be7f7	xorl	%ecx, %ecx
00000000000be7f9	jmp	0xbe80f
00000000000be7fb	cmpq	$-0x1, %rcx
00000000000be7ff	jne	0xbe858
00000000000be801	cmpq	$-0x1, 0x10(%r14)
00000000000be806	jne	0xbe858
00000000000be808	movq	$-0x1, %rcx
00000000000be80f	cmpq	%rcx, 0x18(%r14)
00000000000be813	jne	0xbe858
00000000000be815	movq	-0x78(%rbp), %rcx
00000000000be819	movq	-0x70(%rbp), %rdx
00000000000be81d	movq	-0x68(%rbp), %rsi
00000000000be821	testq	%rcx, %rcx
00000000000be824	js	0xbe82f
00000000000be826	orq	%rsi, %rdx
00000000000be829	jne	0xbe858
00000000000be82b	xorl	%esi, %esi
00000000000be82d	jmp	0xbe83f
00000000000be82f	andq	%rsi, %rdx
00000000000be832	movq	$-0x1, %rsi
00000000000be839	cmpq	$-0x1, %rdx
00000000000be83d	jne	0xbe858
00000000000be83f	cmpq	%rsi, -0x60(%rbp)
00000000000be843	jne	0xbe858
00000000000be845	cqto
00000000000be847	idivq	%rcx
00000000000be84a	leaq	-0x50(%rbp), %rsi
00000000000be84e	movq	%rax, %rdi
00000000000be851	callq	_bignum_s256_init_from_s64
00000000000be856	jmp	0xbe877
00000000000be858	leaq	-0x50(%rbp), %r13
00000000000be85c	xorl	%edi, %edi
00000000000be85e	movq	%r13, %rsi
00000000000be861	callq	_bignum_s256_init_from_s64
00000000000be866	leaq	-0x78(%rbp), %rsi
00000000000be86a	movq	%r14, %rdi
00000000000be86d	movq	%r13, %rdx
00000000000be870	xorl	%ecx, %ecx
00000000000be872	callq	_bignum_s256_divide
00000000000be877	movups	-0x50(%rbp), %xmm0
00000000000be87b	movups	-0x40(%rbp), %xmm1
00000000000be87f	movups	%xmm1, 0x10(%r14)
00000000000be884	movups	%xmm0, (%r14)
00000000000be888	movq	0x88f91(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
00000000000be88f	movq	0x10(%rcx), %rax
00000000000be893	movq	%rax, 0x10(%rbx)
00000000000be897	movups	(%rcx), %xmm0
00000000000be89a	movups	%xmm0, (%rbx)
00000000000be89d	testb	%r12b, %r12b
00000000000be8a0	je	0xbe8a6
00000000000be8a2	orb	$0x2, 0xc(%rbx)
00000000000be8a6	leaq	-0x50(%rbp), %r12
00000000000be8aa	cmpq	$0x0, (%r15)
00000000000be8ae	movq	0x8(%r15), %rax
00000000000be8b2	js	0xbe8c4
00000000000be8b4	testq	%rax, %rax
00000000000be8b7	jne	0xbe8e2
00000000000be8b9	cmpq	$0x0, 0x10(%r15)
00000000000be8be	jne	0xbe8e2
00000000000be8c0	xorl	%eax, %eax
00000000000be8c2	jmp	0xbe8d8
00000000000be8c4	cmpq	$-0x1, %rax
00000000000be8c8	jne	0xbe8e2
00000000000be8ca	cmpq	$-0x1, 0x10(%r15)
00000000000be8cf	jne	0xbe8e2
00000000000be8d1	movq	$-0x1, %rax
00000000000be8d8	cmpq	%rax, 0x18(%r15)
00000000000be8dc	je	0xbe9b4
00000000000be8e2	movq	(%r14), %rax
00000000000be8e5	movq	%rax, %rcx
00000000000be8e8	shrq	$0x20, %rcx
00000000000be8ec	jne	0xbe915
00000000000be8ee	cmpq	$0x0, 0x8(%r14)
00000000000be8f3	jne	0xbe915
00000000000be8f5	cmpq	$0x0, 0x18(%r14)
00000000000be8fa	jne	0xbe915
00000000000be8fc	cmpq	$0x0, 0x10(%r14)
00000000000be901	setne	%cl
00000000000be904	cmpq	$0x2, %rax
00000000000be908	setae	%al
00000000000be90b	orb	%cl, %al
00000000000be90d	cmpb	$0x1, %al
00000000000be90f	jne	0xbe9b4
00000000000be915	orb	$0x2, 0xc(%rbx)
00000000000be919	xorl	%edi, %edi
00000000000be91b	movq	%r12, %rsi
00000000000be91e	callq	_bignum_s256_init_from_s64
00000000000be923	movq	(%r15), %rax
00000000000be926	movl	$0x1, %ecx
00000000000be92b	movq	%rax, %rdx
00000000000be92e	movq	(%r15,%rcx,8), %rax
00000000000be932	shrdq	$0x1, %rax, %rdx
00000000000be937	movq	%rdx, -0x58(%rbp,%rcx,8)
00000000000be93c	incq	%rcx
00000000000be93f	cmpq	$0x4, %rcx
00000000000be943	jne	0xbe92b
00000000000be945	shrq	%rax
00000000000be948	movq	%rax, -0x38(%rbp)
00000000000be94c	movups	-0x50(%rbp), %xmm0
00000000000be950	movups	%xmm0, (%r15)
00000000000be954	movq	-0x40(%rbp), %rax
00000000000be958	movq	%rax, 0x10(%r15)
00000000000be95c	movq	-0x38(%rbp), %rax
00000000000be960	movq	%rax, 0x18(%r15)
00000000000be964	xorl	%edi, %edi
00000000000be966	movq	%r12, %rsi
00000000000be969	callq	_bignum_s256_init_from_s64
00000000000be96e	movq	(%r14), %rax
00000000000be971	movl	$0x1, %ecx
00000000000be976	movq	%rax, %rdx
00000000000be979	movq	(%r14,%rcx,8), %rax
00000000000be97d	shrdq	$0x1, %rax, %rdx
00000000000be982	movq	%rdx, -0x58(%rbp,%rcx,8)
00000000000be987	incq	%rcx
00000000000be98a	cmpq	$0x4, %rcx
00000000000be98e	jne	0xbe976
00000000000be990	shrq	%rax
00000000000be993	movq	%rax, -0x38(%rbp)
00000000000be997	movups	-0x50(%rbp), %xmm0
00000000000be99b	movups	%xmm0, (%r14)
00000000000be99f	movq	-0x40(%rbp), %rax
00000000000be9a3	movq	%rax, 0x10(%r14)
00000000000be9a7	movq	-0x38(%rbp), %rax
00000000000be9ab	movq	%rax, 0x18(%r14)
00000000000be9af	jmp	0xbe8aa
00000000000be9b4	xorl	%r13d, %r13d
00000000000be9b7	leaq	-0x50(%rbp), %r12
00000000000be9bb	movq	(%r14), %rax
00000000000be9be	movq	%rax, %rcx
00000000000be9c1	shrq	$0x20, %rcx
00000000000be9c5	jne	0xbe9d9
00000000000be9c7	cmpq	$0x0, 0x8(%r14)
00000000000be9cc	jne	0xbe9d9
00000000000be9ce	cmpq	$0x0, 0x18(%r14)
00000000000be9d3	je	0xbeac0
00000000000be9d9	cmpq	$0x2, %rax
00000000000be9dd	jl	0xbeb23
00000000000be9e3	orb	$0x2, 0xc(%rbx)
00000000000be9e7	movl	$0x1, %esi
00000000000be9ec	movq	%r15, %rdi
00000000000be9ef	callq	__ZNK24IntermediateLargeIntegereqEx ## IntermediateLargeInteger::operator==(long long) const
00000000000be9f4	testb	%al, %al
00000000000be9f6	je	0xbea25
00000000000be9f8	testb	$0x1, %r13b
00000000000be9fc	jne	0xbeae0
00000000000bea02	movl	$0x1, %edi
00000000000bea07	movq	%r12, %rsi
00000000000bea0a	callq	_bignum_s256_init_from_s64
00000000000bea0f	movups	-0x50(%rbp), %xmm0
00000000000bea13	movups	-0x40(%rbp), %xmm1
00000000000bea17	movups	%xmm1, 0x10(%r15)
00000000000bea1c	movups	%xmm0, (%r15)
00000000000bea20	movb	$0x1, %r13b
00000000000bea23	jmp	0xbea70
00000000000bea25	xorl	%edi, %edi
00000000000bea27	movq	%r12, %rsi
00000000000bea2a	callq	_bignum_s256_init_from_s64
00000000000bea2f	movq	(%r15), %rax
00000000000bea32	movl	$0x1, %ecx
00000000000bea37	movq	%rax, %rdx
00000000000bea3a	movq	(%r15,%rcx,8), %rax
00000000000bea3e	shrdq	$0x1, %rax, %rdx
00000000000bea43	movq	%rdx, -0x58(%rbp,%rcx,8)
00000000000bea48	incq	%rcx
00000000000bea4b	cmpq	$0x4, %rcx
00000000000bea4f	jne	0xbea37
00000000000bea51	shrq	%rax
00000000000bea54	movq	%rax, -0x38(%rbp)
00000000000bea58	movups	-0x50(%rbp), %xmm0
00000000000bea5c	movups	%xmm0, (%r15)
00000000000bea60	movq	-0x40(%rbp), %rax
00000000000bea64	movq	%rax, 0x10(%r15)
00000000000bea68	movq	-0x38(%rbp), %rax
00000000000bea6c	movq	%rax, 0x18(%r15)
00000000000bea70	xorl	%edi, %edi
00000000000bea72	movq	%r12, %rsi
00000000000bea75	callq	_bignum_s256_init_from_s64
00000000000bea7a	movq	(%r14), %rax
00000000000bea7d	movl	$0x1, %ecx
00000000000bea82	movq	%rax, %rdx
00000000000bea85	movq	(%r14,%rcx,8), %rax
00000000000bea89	shrdq	$0x1, %rax, %rdx
00000000000bea8e	movq	%rdx, -0x58(%rbp,%rcx,8)
00000000000bea93	incq	%rcx
00000000000bea96	cmpq	$0x4, %rcx
00000000000bea9a	jne	0xbea82
00000000000bea9c	shrq	%rax
00000000000bea9f	movq	%rax, -0x38(%rbp)
00000000000beaa3	movups	-0x50(%rbp), %xmm0
00000000000beaa7	movups	%xmm0, (%r14)
00000000000beaab	movq	-0x40(%rbp), %rax
00000000000beaaf	movq	%rax, 0x10(%r14)
00000000000beab3	movq	-0x38(%rbp), %rax
00000000000beab7	movq	%rax, 0x18(%r14)
00000000000beabb	jmp	0xbe9bb
00000000000beac0	cmpq	$0x0, 0x10(%r14)
00000000000beac5	setne	%cl
00000000000beac8	cmpq	$0x7fffffff, %rax               ## imm = 0x7FFFFFFF
00000000000beace	seta	%dl
00000000000bead1	cmpq	$0x2, %rax
00000000000bead5	jb	0xbeb23
00000000000bead7	orb	%cl, %dl
00000000000bead9	je	0xbeb23
00000000000beadb	jmp	0xbe9e3
00000000000beae0	leaq	-0x50(%rbp), %r12
00000000000beae4	xorl	%edi, %edi
00000000000beae6	movq	%r12, %rsi
00000000000beae9	callq	_bignum_s256_init_from_s64
00000000000beaee	movups	(%r12), %xmm0
00000000000beaf3	movups	0x10(%r12), %xmm1
00000000000beaf9	movups	%xmm1, 0x10(%r15)
00000000000beafe	movups	%xmm0, (%r15)
00000000000beb02	movl	$0x1, %edi
00000000000beb07	movq	%r12, %rsi
00000000000beb0a	callq	_bignum_s256_init_from_s64
00000000000beb0f	movups	(%r12), %xmm0
00000000000beb14	movups	0x10(%r12), %xmm1
00000000000beb1a	movups	%xmm1, 0x10(%r14)
00000000000beb1f	movups	%xmm0, (%r14)
00000000000beb23	movq	(%r15), %rax
00000000000beb26	movq	0x8(%r15), %rcx
00000000000beb2a	testq	%rax, %rax
00000000000beb2d	js	0xbeb3f
00000000000beb2f	testq	%rcx, %rcx
00000000000beb32	jne	0xbeb59
00000000000beb34	cmpq	$0x0, 0x10(%r15)
00000000000beb39	jne	0xbeb59
00000000000beb3b	xorl	%ecx, %ecx
00000000000beb3d	jmp	0xbeb53
00000000000beb3f	cmpq	$-0x1, %rcx
00000000000beb43	jne	0xbeb59
00000000000beb45	cmpq	$-0x1, 0x10(%r15)
00000000000beb4a	jne	0xbeb59
00000000000beb4c	movq	$-0x1, %rcx
00000000000beb53	cmpq	%rcx, 0x18(%r15)
00000000000beb57	je	0xbeb84
00000000000beb59	movl	$0x1, %esi
00000000000beb5e	movq	%r14, %rdi
00000000000beb61	callq	__ZNK24IntermediateLargeIntegereqEx ## IntermediateLargeInteger::operator==(long long) const
00000000000beb66	testb	%al, %al
00000000000beb68	je	0xbeb81
00000000000beb6a	movq	0x88c87(%rip), %rax             ## literal pool symbol address: _kCMTimePositiveInfinity
00000000000beb71	movq	0x10(%rax), %rcx
00000000000beb75	movq	%rcx, 0x10(%rbx)
00000000000beb79	movups	(%rax), %xmm0
00000000000beb7c	movups	%xmm0, (%rbx)
00000000000beb7f	jmp	0xbeb8d
00000000000beb81	movq	(%r15), %rax
00000000000beb84	movq	%rax, (%rbx)
00000000000beb87	movl	(%r14), %eax
00000000000beb8a	movl	%eax, 0x8(%rbx)
00000000000beb8d	cmpb	$0x0, -0x80(%rbp)
00000000000beb91	je	0xbebef
00000000000beb93	movq	0x88c86(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
00000000000beb9a	movq	0x10(%rcx), %rax
00000000000beb9e	movq	%rax, -0x40(%rbp)
00000000000beba2	movups	(%rcx), %xmm0
00000000000beba5	movaps	%xmm0, -0x50(%rbp)
00000000000beba9	movq	0x10(%rbx), %rax
00000000000bebad	movq	%rax, -0x90(%rbp)
00000000000bebb4	movups	(%rbx), %xmm0
00000000000bebb7	movaps	%xmm0, -0xa0(%rbp)
00000000000bebbe	movq	-0x90(%rbp), %rax
00000000000bebc5	movq	%rax, 0x28(%rsp)
00000000000bebca	movaps	-0xa0(%rbp), %xmm0
00000000000bebd1	movups	%xmm0, 0x18(%rsp)
00000000000bebd6	movq	-0x40(%rbp), %rax
00000000000bebda	movq	%rax, 0x10(%rsp)
00000000000bebdf	movaps	-0x50(%rbp), %xmm0
00000000000bebe3	movups	%xmm0, (%rsp)
00000000000bebe7	movq	%rbx, %rdi
00000000000bebea	callq	0xde3f0                         ## symbol stub for: _CMTimeSubtract
00000000000bebef	movq	%rbx, %rax
00000000000bebf2	addq	$0xc8, %rsp
00000000000bebf9	popq	%rbx
00000000000bebfa	popq	%r12
00000000000bebfc	popq	%r13
00000000000bebfe	popq	%r14
00000000000bec00	popq	%r15
00000000000bec02	popq	%rbp
00000000000bec03	retq
00000000000bec04	cmpq	$0x7fffffff, %rdx               ## imm = 0x7FFFFFFF
00000000000bec0b	ja	0xbe617
00000000000bec11	cmpq	$0x0, 0x10(%r14)
00000000000bec16	jne	0xbe617
00000000000bec1c	movq	%rbx, %rdi
00000000000bec1f	callq	0xde3c0                         ## symbol stub for: _CMTimeMake
00000000000bec24	testb	%r12b, %r12b
00000000000bec27	je	0xbebef
00000000000bec29	orb	$0x2, 0xc(%rbx)
00000000000bec2d	jmp	0xbebef
00000000000bec2f	nop
