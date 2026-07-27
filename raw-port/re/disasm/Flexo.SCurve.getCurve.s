__ZN6SCurve8getCurveEddddRNSt3__16vectorIfNS0_9allocatorIfEEEE:
0000000000063eb0	pushq	%rbp
0000000000063eb1	movq	%rsp, %rbp
0000000000063eb4	pushq	%r15
0000000000063eb6	pushq	%r14
0000000000063eb8	pushq	%r13
0000000000063eba	pushq	%r12
0000000000063ebc	pushq	%rbx
0000000000063ebd	subq	$0xd8, %rsp
0000000000063ec4	movq	%rdi, -0xf0(%rbp)
0000000000063ecb	movq	0x1889cf6(%rip), %rax           ## literal pool symbol address: ___stack_chk_guard
0000000000063ed2	movq	(%rax), %rax
0000000000063ed5	movq	%rax, -0x30(%rbp)
0000000000063ed9	leaq	-0xa0(%rbp), %rdi
0000000000063ee0	leaq	-0xe4(%rbp), %rsi
0000000000063ee7	leaq	-0xe0(%rbp), %rdx
0000000000063eee	callq	__ZN6SCurve30computeBezierShadowsHightlightEddddP6point2RfS2_ ## SCurve::computeBezierShadowsHightlight(double, double, double, double, point2*, float&, float&)
0000000000063ef3	movabsq	$0x3fffffffffffffff, %r13       ## imm = 0x3FFFFFFFFFFFFFFF
0000000000063efd	movss	-0xe4(%rbp), %xmm2
0000000000063f05	movss	0x150905f(%rip), %xmm0
0000000000063f0d	addss	%xmm2, %xmm0
0000000000063f11	addss	%xmm0, %xmm0
0000000000063f15	movss	0x1508db3(%rip), %xmm1
0000000000063f1d	movaps	%xmm1, %xmm3
0000000000063f20	movss	%xmm0, -0xd8(%rbp)
0000000000063f28	subss	%xmm0, %xmm3
0000000000063f2c	movss	%xmm3, -0xd4(%rbp)
0000000000063f34	movss	-0xe0(%rbp), %xmm0
0000000000063f3c	movaps	%xmm1, %xmm3
0000000000063f3f	movss	%xmm0, -0xdc(%rbp)
0000000000063f47	subss	%xmm0, %xmm3
0000000000063f4b	movss	0x1509275(%rip), %xmm0
0000000000063f53	movss	%xmm3, -0xb4(%rbp)
0000000000063f5b	addss	%xmm3, %xmm0
0000000000063f5f	mulss	0x1508d75(%rip), %xmm0
0000000000063f67	movss	%xmm0, -0xd0(%rbp)
0000000000063f6f	subss	%xmm0, %xmm1
0000000000063f73	movss	%xmm1, -0xcc(%rbp)
0000000000063f7b	movq	$0x0, -0xb0(%rbp)
0000000000063f86	xorl	%ecx, %ecx
0000000000063f88	xorl	%edx, %edx
0000000000063f8a	movss	%xmm2, -0xa8(%rbp)
0000000000063f92	jmp	0x63fdb
0000000000063f94	nopw	%cs:(%rax,%rax)
0000000000063fa0	movss	%xmm3, (%r15)
0000000000063fa5	addq	$0x4, %r15
0000000000063fa9	movq	%r15, %r14
0000000000063fac	movq	-0xc0(%rbp), %rdx
0000000000063fb3	movq	%r14, 0x8(%rbx)
0000000000063fb7	incq	%rdx
0000000000063fba	addq	$0x4, %rcx
0000000000063fbe	movq	-0xb0(%rbp), %rax
0000000000063fc5	decl	%eax
0000000000063fc7	movq	%rax, -0xb0(%rbp)
0000000000063fce	cmpq	$0x100, %rdx                    ## imm = 0x100
0000000000063fd5	je	0x6428c
0000000000063fdb	movq	%rcx, -0xc8(%rbp)
0000000000063fe2	xorps	%xmm0, %xmm0
0000000000063fe5	ucomiss	%xmm0, %xmm2
0000000000063fe8	movq	%rdx, -0xc0(%rbp)
0000000000063fef	xorps	%xmm0, %xmm0
0000000000063ff2	cvtsi2ss	%edx, %xmm0
0000000000063ff6	seta	%bl
0000000000063ff9	movss	%xmm0, -0xa4(%rbp)
0000000000064001	divss	0x1508f5f(%rip), %xmm0
0000000000064009	leaq	-0xa0(%rbp), %rdi
0000000000064010	movl	$0xd, %esi
0000000000064015	callq	__Z12BezierYfromXP6point2if     ## BezierYfromX(point2*, int, float)
000000000006401a	movaps	%xmm0, %xmm3
000000000006401d	testb	%bl, %bl
000000000006401f	movq	-0xf0(%rbp), %rbx
0000000000064026	movss	-0xa8(%rbp), %xmm2
000000000006402e	movss	-0xb4(%rbp), %xmm1
0000000000064036	movq	-0xc8(%rbp), %rcx
000000000006403d	jne	0x64070
000000000006403f	movss	0x1508c89(%rip), %xmm0
0000000000064047	ucomiss	-0xdc(%rbp), %xmm0
000000000006404e	ja	0x640fb
0000000000064054	movq	0x8(%rbx), %r15
0000000000064058	movq	0x10(%rbx), %rax
000000000006405c	cmpq	%rax, %r15
000000000006405f	jb	0x63fa0
0000000000064065	jmp	0x641b5
000000000006406a	nopw	(%rax,%rax)
0000000000064070	movss	0x1508c60(%rip), %xmm0
0000000000064078	ucomiss	%xmm2, %xmm0
000000000006407b	leaq	0x150914e(%rip), %rax
0000000000064082	movl	(%rcx,%rax), %eax
0000000000064085	jbe	0x640a0
0000000000064087	addl	-0xb0(%rbp), %eax
000000000006408d	xorps	%xmm0, %xmm0
0000000000064090	cvtsi2ss	%eax, %xmm0
0000000000064094	mulss	%xmm2, %xmm0
0000000000064098	addss	%xmm0, %xmm0
000000000006409c	jmp	0x640da
000000000006409e	nop
00000000000640a0	xorps	%xmm1, %xmm1
00000000000640a3	cvtsi2ss	%eax, %xmm1
00000000000640a7	leaq	0x1509522(%rip), %rax
00000000000640ae	xorps	%xmm0, %xmm0
00000000000640b1	cvtsi2ssl	(%rcx,%rax), %xmm0
00000000000640b6	mulss	-0xd4(%rbp), %xmm1
00000000000640be	mulss	-0xd8(%rbp), %xmm0
00000000000640c6	addss	%xmm1, %xmm0
00000000000640ca	movss	-0xb4(%rbp), %xmm1
00000000000640d2	subss	-0xa4(%rbp), %xmm0
00000000000640da	divss	0x1508e86(%rip), %xmm0
00000000000640e2	addss	%xmm0, %xmm3
00000000000640e6	movss	0x1508be2(%rip), %xmm0
00000000000640ee	ucomiss	-0xdc(%rbp), %xmm0
00000000000640f5	jbe	0x64054
00000000000640fb	movss	0x1508c69(%rip), %xmm0
0000000000064103	ucomiss	%xmm1, %xmm0
0000000000064106	jbe	0x64130
0000000000064108	leaq	0x15098c1(%rip), %rax
000000000006410f	movl	(%rcx,%rax), %eax
0000000000064112	addl	-0xb0(%rbp), %eax
0000000000064118	xorps	%xmm0, %xmm0
000000000006411b	cvtsi2ss	%eax, %xmm0
000000000006411f	mulss	%xmm1, %xmm0
0000000000064123	mulss	0x1508bb1(%rip), %xmm0
000000000006412b	jmp	0x64198
000000000006412d	nopl	(%rax)
0000000000064130	movss	0x1508ba0(%rip), %xmm0
0000000000064138	ucomiss	%xmm1, %xmm0
000000000006413b	jbe	0x64179
000000000006413d	leaq	0x150988c(%rip), %rax
0000000000064144	xorps	%xmm1, %xmm1
0000000000064147	cvtsi2ssl	(%rcx,%rax), %xmm1
000000000006414c	leaq	0x1509c7d(%rip), %rax
0000000000064153	xorps	%xmm0, %xmm0
0000000000064156	cvtsi2ssl	(%rcx,%rax), %xmm0
000000000006415b	mulss	-0xcc(%rbp), %xmm1
0000000000064163	mulss	-0xd0(%rbp), %xmm0
000000000006416b	addss	%xmm1, %xmm0
000000000006416f	subss	-0xa4(%rbp), %xmm0
0000000000064177	jmp	0x64198
0000000000064179	leaq	0x1509c50(%rip), %rax
0000000000064180	movl	(%rcx,%rax), %eax
0000000000064183	addl	-0xb0(%rbp), %eax
0000000000064189	xorps	%xmm0, %xmm0
000000000006418c	cvtsi2ss	%eax, %xmm0
0000000000064190	mulss	%xmm1, %xmm0
0000000000064194	addss	%xmm0, %xmm0
0000000000064198	divss	0x1508dc8(%rip), %xmm0
00000000000641a0	addss	%xmm0, %xmm3
00000000000641a4	movq	0x8(%rbx), %r15
00000000000641a8	movq	0x10(%rbx), %rax
00000000000641ac	cmpq	%rax, %r15
00000000000641af	jb	0x63fa0
00000000000641b5	movq	(%rbx), %r12
00000000000641b8	subq	%r12, %r15
00000000000641bb	movq	%r15, %rbx
00000000000641be	sarq	$0x2, %rbx
00000000000641c2	leaq	0x1(%rbx), %rcx
00000000000641c6	cmpq	%r13, %rcx
00000000000641c9	ja	0x642b5
00000000000641cf	movss	%xmm3, -0xa4(%rbp)
00000000000641d7	subq	%r12, %rax
00000000000641da	movq	%rax, %r14
00000000000641dd	sarq	%r14
00000000000641e0	cmpq	%rcx, %r14
00000000000641e3	cmovbeq	%rcx, %r14
00000000000641e7	movabsq	$0x7ffffffffffffffc, %rcx       ## imm = 0x7FFFFFFFFFFFFFFC
00000000000641f1	cmpq	%rcx, %rax
00000000000641f4	cmovaeq	%r13, %r14
00000000000641f8	cmpq	%r13, %r14
00000000000641fb	ja	0x642ae
0000000000064201	leaq	(,%r14,4), %rdi
0000000000064209	callq	0x1497452                       ## symbol stub for: __Znwm
000000000006420e	movss	-0xa4(%rbp), %xmm0
0000000000064216	leaq	(%rax,%r15), %r13
000000000006421a	leaq	(%rax,%r14,4), %rcx
000000000006421e	movq	%rcx, -0xf8(%rbp)
0000000000064225	movss	%xmm0, (%rax,%r15)
000000000006422b	leaq	(%rax,%r15), %r14
000000000006422f	addq	$0x4, %r14
0000000000064233	shlq	$0x2, %rbx
0000000000064237	subq	%rbx, %r13
000000000006423a	movq	%r13, %rdi
000000000006423d	movq	%r12, %rsi
0000000000064240	movq	%r15, %rdx
0000000000064243	callq	0x14978ba                       ## symbol stub for: _memcpy
0000000000064248	movq	-0xf0(%rbp), %rbx
000000000006424f	movq	%r13, (%rbx)
0000000000064252	movq	%r14, 0x8(%rbx)
0000000000064256	movq	-0xf8(%rbp), %rax
000000000006425d	movq	%rax, 0x10(%rbx)
0000000000064261	testq	%r12, %r12
0000000000064264	je	0x6426e
0000000000064266	movq	%r12, %rdi
0000000000064269	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000006426e	movabsq	$0x3fffffffffffffff, %r13       ## imm = 0x3FFFFFFFFFFFFFFF
0000000000064278	movss	-0xa8(%rbp), %xmm2
0000000000064280	movq	-0xc8(%rbp), %rcx
0000000000064287	jmp	0x63fac
000000000006428c	movq	0x1889935(%rip), %rax           ## literal pool symbol address: ___stack_chk_guard
0000000000064293	movq	(%rax), %rax
0000000000064296	cmpq	-0x30(%rbp), %rax
000000000006429a	jne	0x642bc
000000000006429c	addq	$0xd8, %rsp
00000000000642a3	popq	%rbx
00000000000642a4	popq	%r12
00000000000642a6	popq	%r13
00000000000642a8	popq	%r14
00000000000642aa	popq	%r15
00000000000642ac	popq	%rbp
00000000000642ad	retq
00000000000642ae	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
00000000000642b3	jmp	0x642ba
00000000000642b5	callq	__ZNSt3__16vectorIfNS_9allocatorIfEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<float, std::__1::allocator<float>>::__throw_length_error[abi:nqe210106]()
00000000000642ba	ud2
00000000000642bc	callq	0x14974f4                       ## symbol stub for: ___stack_chk_fail
00000000000642c1	movq	%rax, %rdi
00000000000642c4	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
00000000000642c9	nopl	(%rax)
__ZN6SCurve7maxDiffERKNSt3__16vectorIfNS0_9allocatorIfEEEES6_dddd:
00000000000642d0	pushq	%rbp
00000000000642d1	movq	%rsp, %rbp
00000000000642d4	pushq	%r15
