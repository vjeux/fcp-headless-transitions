__ZN15ArrowGeneration25bestMatchingIndexOrInsertERNSt3__16vectorI25OZVelocityViewArrowVertexNS0_9allocatorIS2_EEEERKS2_:
00000000003fc760	pushq	%rbp
00000000003fc761	movq	%rsp, %rbp
00000000003fc764	pushq	%r15
00000000003fc766	pushq	%r14
00000000003fc768	pushq	%r13
00000000003fc76a	pushq	%r12
00000000003fc76c	pushq	%rbx
00000000003fc76d	subq	$0x18, %rsp
00000000003fc771	movq	%rdi, %r14
00000000003fc774	movq	(%rdi), %r8
00000000003fc777	movq	0x8(%rdi), %rax
00000000003fc77b	movq	%rax, %rbx
00000000003fc77e	subq	%r8, %rbx
00000000003fc781	movq	%rbx, %r15
00000000003fc784	sarq	$0x5, %r15
00000000003fc788	testl	%r15d, %r15d
00000000003fc78b	jle	0x3fc821
00000000003fc791	movaps	(%rsi), %xmm0
00000000003fc794	movaps	0x10(%rsi), %xmm1
00000000003fc798	movl	%r15d, %ecx
00000000003fc79b	andl	$0x7fffffff, %ecx               ## imm = 0x7FFFFFFF
00000000003fc7a1	leaq	0x10(%r8), %rdx
00000000003fc7a5	movss	0x30adaf(%rip), %xmm2
00000000003fc7ad	movl	$0xffffffff, %r12d              ## imm = 0xFFFFFFFF
00000000003fc7b3	xorl	%edi, %edi
00000000003fc7b5	movss	0x30e7e3(%rip), %xmm3
00000000003fc7bd	jmp	0x3fc7cc
00000000003fc7bf	nop
00000000003fc7c0	incq	%rdi
00000000003fc7c3	addq	$0x20, %rdx
00000000003fc7c7	cmpq	%rdi, %rcx
00000000003fc7ca	je	0x3fc80f
00000000003fc7cc	movaps	-0x10(%rdx), %xmm4
00000000003fc7d0	subps	%xmm0, %xmm4
00000000003fc7d3	mulps	%xmm4, %xmm4
00000000003fc7d6	movshdup	%xmm4, %xmm5                    ## xmm5 = xmm4[1,1,3,3]
00000000003fc7da	addss	%xmm4, %xmm5
00000000003fc7de	movhlps	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000003fc7e1	addss	%xmm5, %xmm4
00000000003fc7e5	ucomiss	%xmm4, %xmm3
00000000003fc7e8	jbe	0x3fc7c0
00000000003fc7ea	movaps	(%rdx), %xmm4
00000000003fc7ed	mulps	%xmm1, %xmm4
00000000003fc7f0	movshdup	%xmm4, %xmm5                    ## xmm5 = xmm4[1,1,3,3]
00000000003fc7f4	addss	%xmm4, %xmm5
00000000003fc7f8	movhlps	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000003fc7fb	addss	%xmm5, %xmm4
00000000003fc7ff	ucomiss	%xmm2, %xmm4
00000000003fc802	maxss	%xmm2, %xmm4
00000000003fc806	cmoval	%edi, %r12d
00000000003fc80a	movaps	%xmm4, %xmm2
00000000003fc80d	jmp	0x3fc7c0
00000000003fc80f	testl	%r12d, %r12d
00000000003fc812	js	0x3fc821
00000000003fc814	ucomiss	0x310825(%rip), %xmm2
00000000003fc81b	jae	0x3fc90a
00000000003fc821	movq	0x10(%r14), %rcx
00000000003fc825	cmpq	%rcx, %rax
00000000003fc828	jae	0x3fc844
00000000003fc82a	movaps	(%rsi), %xmm0
00000000003fc82d	movaps	0x10(%rsi), %xmm1
00000000003fc831	movaps	%xmm1, 0x10(%rax)
00000000003fc835	movaps	%xmm0, (%rax)
00000000003fc838	addq	$0x20, %rax
00000000003fc83c	movq	%rax, %r12
00000000003fc83f	jmp	0x3fc8fc
00000000003fc844	leaq	0x1(%r15), %rax
00000000003fc848	movq	%rax, %rdx
00000000003fc84b	shrq	$0x3b, %rdx
00000000003fc84f	jne	0x3fc91c
00000000003fc855	movq	%r14, -0x38(%rbp)
00000000003fc859	movabsq	$0x7ffffffffffffff, %rdx        ## imm = 0x7FFFFFFFFFFFFFF
00000000003fc863	subq	%r8, %rcx
00000000003fc866	movq	%rcx, %r13
00000000003fc869	sarq	$0x4, %r13
00000000003fc86d	cmpq	%rax, %r13
00000000003fc870	cmovbeq	%rax, %r13
00000000003fc874	movabsq	$0x7fffffffffffffe0, %rax       ## imm = 0x7FFFFFFFFFFFFFE0
00000000003fc87e	cmpq	%rax, %rcx
00000000003fc881	cmovaeq	%rdx, %r13
00000000003fc885	cmpq	%rdx, %r13
00000000003fc888	movq	%r8, -0x30(%rbp)
00000000003fc88c	ja	0x3fc921
00000000003fc892	movq	%rsi, %r12
00000000003fc895	shlq	$0x5, %r13
00000000003fc899	movq	%r13, %rdi
00000000003fc89c	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003fc8a1	leaq	(%rax,%rbx), %r14
00000000003fc8a5	addq	%rax, %r13
00000000003fc8a8	movaps	(%r12), %xmm0
00000000003fc8ad	movaps	0x10(%r12), %xmm1
00000000003fc8b3	movaps	%xmm0, (%rax,%rbx)
00000000003fc8b7	movaps	%xmm1, 0x10(%rax,%rbx)
00000000003fc8bc	leaq	(%rax,%rbx), %r12
00000000003fc8c0	addq	$0x20, %r12
00000000003fc8c4	shlq	$0x5, %r15
00000000003fc8c8	subq	%r15, %r14
00000000003fc8cb	movq	%r14, %rdi
00000000003fc8ce	movq	-0x30(%rbp), %r15
00000000003fc8d2	movq	%r15, %rsi
00000000003fc8d5	movq	%rbx, %rdx
00000000003fc8d8	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003fc8dd	movq	-0x38(%rbp), %rax
00000000003fc8e1	movq	%r14, (%rax)
00000000003fc8e4	movq	%rax, %r14
00000000003fc8e7	movq	%r12, 0x8(%rax)
00000000003fc8eb	movq	%r13, 0x10(%rax)
00000000003fc8ef	testq	%r15, %r15
00000000003fc8f2	je	0x3fc8fc
00000000003fc8f4	movq	%r15, %rdi
00000000003fc8f7	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003fc8fc	movq	%r12, 0x8(%r14)
00000000003fc900	subq	(%r14), %r12
00000000003fc903	shrq	$0x5, %r12
00000000003fc907	decl	%r12d
00000000003fc90a	movl	%r12d, %eax
00000000003fc90d	addq	$0x18, %rsp
00000000003fc911	popq	%rbx
00000000003fc912	popq	%r12
00000000003fc914	popq	%r13
00000000003fc916	popq	%r14
00000000003fc918	popq	%r15
00000000003fc91a	popq	%rbp
00000000003fc91b	retq
00000000003fc91c	callq	__ZNSt3__16vectorI25OZVelocityViewArrowVertexNS_9allocatorIS1_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<OZVelocityViewArrowVertex, std::__1::allocator<OZVelocityViewArrowVertex>>::__throw_length_error[abi:nqe210106]()
00000000003fc921	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
00000000003fc926	nopw	%cs:(%rax,%rax)
