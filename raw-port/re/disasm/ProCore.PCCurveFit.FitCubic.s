__ZN10PCCurveFit8FitCubicERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEmmRS3_S8_d:
000000000000b62c	pushq	%rbp
000000000000b62d	movq	%rsp, %rbp
000000000000b630	pushq	%r15
000000000000b632	pushq	%r14
000000000000b634	pushq	%r13
000000000000b636	pushq	%r12
000000000000b638	pushq	%rbx
000000000000b639	subq	$0x98, %rsp
000000000000b640	movsd	%xmm0, -0x50(%rbp)
000000000000b645	movq	%r9, -0x48(%rbp)
000000000000b649	movq	%r8, %r15
000000000000b64c	movq	%rcx, %r13
000000000000b64f	movq	%rdx, %r12
000000000000b652	movq	%rsi, -0x38(%rbp)
000000000000b656	movq	0x10(%rbp), %r14
000000000000b65a	xorl	%eax, %eax
000000000000b65c	movq	%rax, 0x10(%rdi)
000000000000b660	xorpd	%xmm0, %xmm0
000000000000b664	movupd	%xmm0, (%rdi)
000000000000b668	movapd	%xmm0, -0xb0(%rbp)
000000000000b670	movq	%rax, -0x60(%rbp)
000000000000b674	movq	%r8, %rax
000000000000b677	subq	%rcx, %rax
000000000000b67a	cmpq	$0x1, %rax
000000000000b67e	movq	%rdi, -0x30(%rbp)
000000000000b682	jne	0xb6ea
000000000000b684	movq	%rdi, %rbx
000000000000b687	movq	(%r12), %rax
000000000000b68b	shlq	$0x4, %r15
000000000000b68f	shlq	$0x4, %r13
000000000000b693	leaq	(%rax,%r13), %rsi
000000000000b697	movsd	(%rax,%r15), %xmm0
000000000000b69d	movsd	0x8(%rax,%r15), %xmm1
000000000000b6a4	subsd	(%rax,%r13), %xmm0
000000000000b6aa	movsd	%xmm0, -0x38(%rbp)
000000000000b6af	subsd	0x8(%rax,%r13), %xmm1
000000000000b6b6	movsd	%xmm1, -0x40(%rbp)
000000000000b6bb	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000b6c0	movq	(%r12), %rsi
000000000000b6c4	movq	0x10(%rbx), %rdx
000000000000b6c8	movq	%rax, 0x8(%rbx)
000000000000b6cc	leaq	(%rsi,%r13), %rcx
000000000000b6d0	cmpq	%rdx, %rax
000000000000b6d3	jae	0xb785
000000000000b6d9	movupd	(%rcx), %xmm0
000000000000b6dd	movupd	%xmm0, (%rax)
000000000000b6e1	addq	$0x10, %rax
000000000000b6e5	jmp	0xb798
000000000000b6ea	movq	%r12, %rsi
000000000000b6ed	movq	%r13, %rdx
000000000000b6f0	movq	%r15, %rcx
000000000000b6f3	callq	__ZN10PCCurveFit23ChordLengthParameterizeERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEmm ## PCCurveFit::ChordLengthParameterize(std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, unsigned long, unsigned long)
000000000000b6f8	movq	%rax, %rsi
000000000000b6fb	movq	%r14, 0x8(%rsp)
000000000000b700	movq	-0x48(%rbp), %rax
000000000000b704	movq	%rax, (%rsp)
000000000000b708	leaq	-0x80(%rbp), %rdi
000000000000b70c	movq	%r12, -0x40(%rbp)
000000000000b710	movq	%r12, %rdx
000000000000b713	movq	%r13, %rcx
000000000000b716	movq	%r15, %r8
000000000000b719	movq	%rsi, %r14
000000000000b71c	movq	%rsi, %r9
000000000000b71f	callq	__ZN10PCCurveFit14GenerateBezierERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEmmPdRS3_S9_ ## PCCurveFit::GenerateBezier(std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, unsigned long, unsigned long, double*, PCVector2<double>&, PCVector2<double>&)
000000000000b724	movq	-0x30(%rbp), %rbx
000000000000b728	movq	(%rbx), %rdi
000000000000b72b	testq	%rdi, %rdi
000000000000b72e	je	0xb739
000000000000b730	movq	%rdi, 0x8(%rbx)
000000000000b734	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000000b739	movapd	-0x80(%rbp), %xmm0
000000000000b73e	movupd	%xmm0, (%rbx)
000000000000b742	movq	-0x70(%rbp), %rax
000000000000b746	movq	%rax, 0x10(%rbx)
000000000000b74a	leaq	-0x60(%rbp), %rax
000000000000b74e	movq	%rax, (%rsp)
000000000000b752	movq	-0x38(%rbp), %rdi
000000000000b756	movq	-0x40(%rbp), %rsi
000000000000b75a	movq	%rbx, %rdx
000000000000b75d	movq	%r13, %rcx
000000000000b760	movq	%r15, %r8
000000000000b763	movq	%r14, %r9
000000000000b766	callq	__ZN10PCCurveFit15ComputeMaxErrorERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEES7_mmPdPm ## PCCurveFit::ComputeMaxError(std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, unsigned long, unsigned long, double*, unsigned long*)
000000000000b76b	movq	%r14, %rax
000000000000b76e	movsd	-0x50(%rbp), %xmm1
000000000000b773	ucomisd	%xmm0, %xmm1
000000000000b777	jbe	0xb8ab
000000000000b77d	movq	%rax, %rdi
000000000000b780	jmp	0xba85
000000000000b785	movq	%rbx, %rdi
000000000000b788	movq	%rcx, %rsi
000000000000b78b	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000b790	movq	(%r12), %rsi
000000000000b794	movq	0x10(%rbx), %rdx
000000000000b798	movq	%rax, 0x8(%rbx)
000000000000b79c	addq	%rsi, %r13
000000000000b79f	cmpq	%rdx, %rax
000000000000b7a2	jae	0xb7b4
000000000000b7a4	movupd	(%r13), %xmm0
000000000000b7aa	movupd	%xmm0, (%rax)
000000000000b7ae	addq	$0x10, %rax
000000000000b7b2	jmp	0xb7c7
000000000000b7b4	movq	%rbx, %rdi
000000000000b7b7	movq	%r13, %rsi
000000000000b7ba	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000b7bf	movq	(%r12), %rsi
000000000000b7c3	movq	0x10(%rbx), %rdx
000000000000b7c7	movq	%rax, 0x8(%rbx)
000000000000b7cb	addq	%r15, %rsi
000000000000b7ce	cmpq	%rdx, %rax
000000000000b7d1	jae	0xb7e1
000000000000b7d3	movupd	(%rsi), %xmm0
000000000000b7d7	movupd	%xmm0, (%rax)
000000000000b7db	addq	$0x10, %rax
000000000000b7df	jmp	0xb7e9
000000000000b7e1	movq	%rbx, %rdi
000000000000b7e4	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE24__emplace_back_slow_pathIJRKS2_EEEPS2_DpOT_ ## PCVector2<double>* std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__emplace_back_slow_path<PCVector2<double> const&>(PCVector2<double> const&)
000000000000b7e9	movsd	-0x38(%rbp), %xmm0
000000000000b7ee	mulsd	%xmm0, %xmm0
000000000000b7f2	movsd	-0x40(%rbp), %xmm1
000000000000b7f7	mulsd	%xmm1, %xmm1
000000000000b7fb	addsd	%xmm0, %xmm1
000000000000b7ff	xorps	%xmm0, %xmm0
000000000000b802	sqrtsd	%xmm1, %xmm0
000000000000b806	divsd	0x116e1a(%rip), %xmm0
000000000000b80e	movq	%rax, 0x8(%rbx)
000000000000b812	movq	-0x48(%rbp), %rax
000000000000b816	movupd	(%rax), %xmm1
000000000000b81a	movapd	%xmm1, %xmm3
000000000000b81e	mulpd	%xmm1, %xmm3
000000000000b822	haddpd	%xmm3, %xmm3
000000000000b826	xorpd	%xmm2, %xmm2
000000000000b82a	ucomisd	%xmm2, %xmm3
000000000000b82e	jne	0xb832
000000000000b830	jnp	0xb84a
000000000000b832	sqrtsd	%xmm3, %xmm3
000000000000b836	movapd	%xmm0, %xmm4
000000000000b83a	divsd	%xmm3, %xmm4
000000000000b83e	movddup	%xmm4, %xmm3                    ## xmm3 = xmm4[0,0]
000000000000b842	mulpd	%xmm3, %xmm1
000000000000b846	movupd	%xmm1, (%rax)
000000000000b84a	movupd	(%r14), %xmm3
000000000000b84f	movapd	%xmm3, %xmm4
000000000000b853	mulpd	%xmm3, %xmm4
000000000000b857	haddpd	%xmm4, %xmm4
000000000000b85b	ucomisd	%xmm2, %xmm4
000000000000b85f	jne	0xb863
000000000000b861	jnp	0xb883
000000000000b863	xorps	%xmm1, %xmm1
000000000000b866	sqrtsd	%xmm4, %xmm1
000000000000b86a	divsd	%xmm1, %xmm0
000000000000b86e	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
000000000000b872	mulpd	%xmm0, %xmm3
000000000000b876	movupd	%xmm3, (%r14)
000000000000b87b	movq	-0x48(%rbp), %rax
000000000000b87f	movupd	(%rax), %xmm1
000000000000b883	movq	(%rbx), %rax
000000000000b886	movupd	(%rax), %xmm0
000000000000b88a	addpd	%xmm1, %xmm0
000000000000b88e	movupd	0x30(%rax), %xmm1
000000000000b893	movupd	%xmm0, 0x10(%rax)
000000000000b898	movupd	(%r14), %xmm0
000000000000b89d	addpd	%xmm1, %xmm0
000000000000b8a1	movupd	%xmm0, 0x20(%rax)
000000000000b8a6	jmp	0xba8e
000000000000b8ab	movq	%r13, -0x88(%rbp)
000000000000b8b2	movq	%r15, -0x58(%rbp)
000000000000b8b6	mulsd	%xmm1, %xmm1
000000000000b8ba	ucomisd	%xmm0, %xmm1
000000000000b8be	jbe	0xb99f
000000000000b8c4	movl	$0x14, %r15d
000000000000b8ca	movq	-0x40(%rbp), %r12
000000000000b8ce	movq	-0x88(%rbp), %r13
000000000000b8d5	movq	-0x38(%rbp), %rdi
000000000000b8d9	movq	%r12, %rsi
000000000000b8dc	movq	-0x30(%rbp), %rdx
000000000000b8e0	movq	%r13, %rcx
000000000000b8e3	movq	-0x58(%rbp), %rbx
000000000000b8e7	movq	%rbx, %r8
000000000000b8ea	movq	%rax, -0x98(%rbp)
000000000000b8f1	movq	%rax, %r9
000000000000b8f4	callq	__ZN10PCCurveFit14ReparameterizeERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEES7_mmPd ## PCCurveFit::Reparameterize(std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, unsigned long, unsigned long, double*)
000000000000b8f9	movq	%rax, %r14
000000000000b8fc	movq	0x10(%rbp), %rax
000000000000b900	movq	%rax, 0x8(%rsp)
000000000000b905	movq	-0x48(%rbp), %rax
000000000000b909	movq	%rax, (%rsp)
000000000000b90d	leaq	-0x80(%rbp), %rdi
000000000000b911	movq	%r12, %rdx
000000000000b914	movq	%r13, %rcx
000000000000b917	movq	%rbx, %r8
000000000000b91a	movq	%r14, %r9
000000000000b91d	callq	__ZN10PCCurveFit14GenerateBezierERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEmmPdRS3_S9_ ## PCCurveFit::GenerateBezier(std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, unsigned long, unsigned long, double*, PCVector2<double>&, PCVector2<double>&)
000000000000b922	movq	-0x30(%rbp), %rbx
000000000000b926	movq	(%rbx), %rdi
000000000000b929	testq	%rdi, %rdi
000000000000b92c	je	0xb937
000000000000b92e	movq	%rdi, 0x8(%rbx)
000000000000b932	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000000b937	movapd	-0x80(%rbp), %xmm0
000000000000b93c	movupd	%xmm0, (%rbx)
000000000000b940	movq	-0x70(%rbp), %rax
000000000000b944	movq	%rax, 0x10(%rbx)
000000000000b948	leaq	-0x60(%rbp), %rax
000000000000b94c	movq	%rax, (%rsp)
000000000000b950	movq	-0x38(%rbp), %rdi
000000000000b954	movq	-0x40(%rbp), %rsi
000000000000b958	movq	%rbx, %rdx
000000000000b95b	movq	%r13, %rcx
000000000000b95e	movq	-0x58(%rbp), %r8
000000000000b962	movq	%r14, %r9
000000000000b965	callq	__ZN10PCCurveFit15ComputeMaxErrorERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEES7_mmPdPm ## PCCurveFit::ComputeMaxError(std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, unsigned long, unsigned long, double*, unsigned long*)
000000000000b96a	movsd	%xmm0, -0x90(%rbp)
000000000000b972	movq	-0x98(%rbp), %rdi
000000000000b979	callq	0xde6ba                         ## symbol stub for: __ZdaPv
000000000000b97e	movsd	-0x50(%rbp), %xmm0
000000000000b983	ucomisd	-0x90(%rbp), %xmm0
000000000000b98b	ja	0xba82
000000000000b991	movq	%r14, %rax
000000000000b994	decq	%r15
000000000000b997	jne	0xb8d5
000000000000b99d	jmp	0xb9a2
000000000000b99f	movq	%rax, %r14
000000000000b9a2	movq	%r14, %rdi
000000000000b9a5	callq	0xde6ba                         ## symbol stub for: __ZdaPv
000000000000b9aa	movq	-0x60(%rbp), %r14
000000000000b9ae	leaq	-0xb0(%rbp), %r12
000000000000b9b5	movq	%r12, %rdi
000000000000b9b8	movq	-0x40(%rbp), %rbx
000000000000b9bc	movq	%rbx, %rdx
000000000000b9bf	movq	%r14, %rcx
000000000000b9c2	callq	__ZN10PCCurveFit20ComputeCenterTangentERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEm ## PCCurveFit::ComputeCenterTangent(std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, unsigned long)
000000000000b9c7	movq	%r12, (%rsp)
000000000000b9cb	movq	%rbx, %r12
000000000000b9ce	leaq	-0x80(%rbp), %rdi
000000000000b9d2	movq	-0x38(%rbp), %rsi
000000000000b9d6	movq	%rbx, %rdx
000000000000b9d9	movq	-0x88(%rbp), %rcx
000000000000b9e0	movq	%r14, %r8
000000000000b9e3	movq	-0x48(%rbp), %r9
000000000000b9e7	movsd	-0x50(%rbp), %xmm0
000000000000b9ec	callq	__ZN10PCCurveFit8FitCubicERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEmmRS3_S8_d ## PCCurveFit::FitCubic(std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, unsigned long, unsigned long, PCVector2<double>&, PCVector2<double>&, double)
000000000000b9f1	movq	-0x30(%rbp), %rbx
000000000000b9f5	movq	(%rbx), %rdi
000000000000b9f8	testq	%rdi, %rdi
000000000000b9fb	movq	-0x58(%rbp), %r15
000000000000b9ff	je	0xba0a
000000000000ba01	movq	%rdi, 0x8(%rbx)
000000000000ba05	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000000ba0a	leaq	-0x80(%rbp), %rdi
000000000000ba0e	movaps	(%rdi), %xmm0
000000000000ba11	movups	%xmm0, (%rbx)
000000000000ba14	movq	0x10(%rdi), %rax
000000000000ba18	movq	%rax, 0x10(%rbx)
000000000000ba1c	leaq	-0xb0(%rbp), %r9
000000000000ba23	movaps	(%r9), %xmm0
000000000000ba27	xorps	0xd6642(%rip), %xmm0
000000000000ba2e	movaps	%xmm0, (%r9)
000000000000ba32	movq	0x10(%rbp), %rax
000000000000ba36	movq	%rax, (%rsp)
000000000000ba3a	movq	-0x38(%rbp), %rsi
000000000000ba3e	movq	%r12, %rdx
000000000000ba41	movq	%r14, %rcx
000000000000ba44	movq	%r15, %r8
000000000000ba47	movsd	-0x50(%rbp), %xmm0
000000000000ba4c	callq	__ZN10PCCurveFit8FitCubicERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEmmRS3_S8_d ## PCCurveFit::FitCubic(std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, unsigned long, unsigned long, PCVector2<double>&, PCVector2<double>&, double)
000000000000ba51	movq	-0x80(%rbp), %r15
000000000000ba55	movq	-0x78(%rbp), %rcx
000000000000ba59	leaq	0x10(%r15), %rdx
000000000000ba5d	movq	0x8(%rbx), %rsi
000000000000ba61	movq	%rcx, %r8
000000000000ba64	subq	%rdx, %r8
000000000000ba67	sarq	$0x4, %r8
000000000000ba6b	movq	%rbx, %rdi
000000000000ba6e	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE18__insert_with_sizeB9nqe210106INS_11__wrap_iterIPS2_EES9_EES9_NS7_IPKS2_EET_T0_l ## std::__1::__wrap_iter<PCVector2<double>*> std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__insert_with_size[abi:nqe210106]<std::__1::__wrap_iter<PCVector2<double>*>, std::__1::__wrap_iter<PCVector2<double>*>>(std::__1::__wrap_iter<PCVector2<double> const*>, std::__1::__wrap_iter<PCVector2<double>*>, std::__1::__wrap_iter<PCVector2<double>*>, long)
000000000000ba73	testq	%r15, %r15
000000000000ba76	je	0xba8e
000000000000ba78	movq	%r15, %rdi
000000000000ba7b	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000000ba80	jmp	0xba8e
000000000000ba82	movq	%r14, %rdi
000000000000ba85	callq	0xde6ba                         ## symbol stub for: __ZdaPv
000000000000ba8a	movq	-0x30(%rbp), %rbx
000000000000ba8e	movq	%rbx, %rax
000000000000ba91	addq	$0x98, %rsp
000000000000ba98	popq	%rbx
000000000000ba99	popq	%r12
000000000000ba9b	popq	%r13
000000000000ba9d	popq	%r14
000000000000ba9f	popq	%r15
000000000000baa1	popq	%rbp
000000000000baa2	retq
000000000000baa3	movq	%rax, %r14
000000000000baa6	testq	%r15, %r15
000000000000baa9	je	0xbac4
000000000000baab	movq	%r15, %rdi
000000000000baae	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000000bab3	jmp	0xbac4
000000000000bab5	jmp	0xbac1
000000000000bab7	jmp	0xbac1
000000000000bab9	jmp	0xbac1
000000000000babb	jmp	0xbac1
000000000000babd	jmp	0xbac1
000000000000babf	jmp	0xbac1
000000000000bac1	movq	%rax, %r14
000000000000bac4	movq	-0x30(%rbp), %rax
000000000000bac8	movq	(%rax), %rdi
000000000000bacb	testq	%rdi, %rdi
000000000000bace	je	0xbadd
000000000000bad0	movq	-0x30(%rbp), %rax
000000000000bad4	movq	%rdi, 0x8(%rax)
000000000000bad8	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000000badd	movq	%r14, %rdi
000000000000bae0	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
000000000000bae5	nop
