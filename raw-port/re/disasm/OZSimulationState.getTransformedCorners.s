__ZN17OZSimulationState21getTransformedCornersEP9OZElementP9PCVector3IdES4_S4_S4_:
00000000001ef6d0	pushq	%rbp
00000000001ef6d1	movq	%rsp, %rbp
00000000001ef6d4	pushq	%r15
00000000001ef6d6	pushq	%r14
00000000001ef6d8	pushq	%r13
00000000001ef6da	pushq	%r12
00000000001ef6dc	pushq	%rbx
00000000001ef6dd	subq	$0x3b8, %rsp                    ## imm = 0x3B8
00000000001ef6e4	movq	%r9, -0x120(%rbp)
00000000001ef6eb	movq	%r8, -0x118(%rbp)
00000000001ef6f2	movq	%rcx, -0x110(%rbp)
00000000001ef6f9	movq	%rdx, -0x108(%rbp)
00000000001ef700	movq	%rsi, %r13
00000000001ef703	movq	%rdi, %rbx
00000000001ef706	movsd	(%rdi), %xmm0
00000000001ef70a	movsd	%xmm0, -0x48(%rbp)
00000000001ef70f	movups	0x8(%rdi), %xmm0
00000000001ef713	movaps	%xmm0, -0x130(%rbp)
00000000001ef71a	leaq	-0x3c0(%rbp), %r12
00000000001ef721	movq	%r12, %rdi
00000000001ef724	callq	__ZN13OZRenderStateC1Ev         ## OZRenderState::OZRenderState()
00000000001ef729	leaq	0xb0(%rbx), %r15
00000000001ef730	movq	0xc0(%rbx), %rax
00000000001ef737	movq	%rax, -0x3b0(%rbp)
00000000001ef73e	movups	0xb0(%rbx), %xmm0
00000000001ef745	movaps	%xmm0, -0x3c0(%rbp)
00000000001ef74c	movb	$0x0, -0x2f8(%rbp)
00000000001ef753	movq	(%r13), %rax
00000000001ef757	leaq	-0x30(%rbp), %rsi
00000000001ef75b	leaq	-0x80(%rbp), %rdx
00000000001ef75f	leaq	-0x78(%rbp), %rcx
00000000001ef763	xorl	%r14d, %r14d
00000000001ef766	movq	%r13, %rdi
00000000001ef769	movq	%r12, %r8
00000000001ef76c	xorl	%r9d, %r9d
00000000001ef76f	callq	*0x538(%rax)
00000000001ef775	leaq	-0x70(%rbp), %rsi
00000000001ef779	leaq	-0x68(%rbp), %rdx
00000000001ef77d	movq	%r13, %rdi
00000000001ef780	movq	%r15, %rcx
00000000001ef783	callq	__ZNK15OZTransformNode8getShearEPdS0_RK6CMTime ## OZTransformNode::getShear(double*, double*, CMTime const&) const
00000000001ef788	leaq	-0x60(%rbp), %rsi
00000000001ef78c	leaq	-0x58(%rbp), %rdx
00000000001ef790	leaq	-0x50(%rbp), %rcx
00000000001ef794	movq	%r13, %rdi
00000000001ef797	movq	%r15, %r8
00000000001ef79a	callq	__ZNK15OZTransformNode8getPivotEPdS0_S0_RK6CMTime ## OZTransformNode::getPivot(double*, double*, double*, CMTime const&) const
00000000001ef79f	movabsq	$0x3ff0000000000000, %r15       ## imm = 0x3FF0000000000000
00000000001ef7a9	movq	%r15, -0x88(%rbp)
00000000001ef7b0	movq	%r15, -0xb0(%rbp)
00000000001ef7b7	movq	%r15, -0xd8(%rbp)
00000000001ef7be	movq	%r15, -0x100(%rbp)
00000000001ef7c5	xorps	%xmm0, %xmm0
00000000001ef7c8	movups	%xmm0, -0xf8(%rbp)
00000000001ef7cf	movups	%xmm0, -0xe8(%rbp)
00000000001ef7d6	movaps	%xmm0, -0xd0(%rbp)
00000000001ef7dd	movaps	%xmm0, -0xc0(%rbp)
00000000001ef7e4	movups	%xmm0, -0xa8(%rbp)
00000000001ef7eb	movups	%xmm0, -0x98(%rbp)
00000000001ef7f2	movq	0x3b8(%r13), %rdi
00000000001ef7f9	testq	%rdi, %rdi
00000000001ef7fc	je	0x1ef816
00000000001ef7fe	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000001ef805	leaq	__ZTI7OZGroup(%rip), %rdx       ## typeinfo for OZGroup
00000000001ef80c	xorl	%ecx, %ecx
00000000001ef80e	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000001ef813	movq	%rax, %r14
00000000001ef816	movq	(%r13), %rax
00000000001ef81a	movq	%r13, %rdi
00000000001ef81d	callq	*0x110(%rax)
00000000001ef823	movsd	0xc0(%rax), %xmm0
00000000001ef82b	testq	%r14, %r14
00000000001ef82e	movapd	%xmm0, -0x40(%rbp)
00000000001ef833	je	0x1ef852
00000000001ef835	movq	(%r14), %rax
00000000001ef838	movq	%r14, %rdi
00000000001ef83b	callq	*0x548(%rax)
00000000001ef841	movaps	-0x40(%rbp), %xmm1
00000000001ef845	movsd	%xmm1, -0x398(%rbp)
00000000001ef84d	movapd	%xmm0, -0x40(%rbp)
00000000001ef852	movq	(%r13), %rax
00000000001ef856	movq	%r13, %rdi
00000000001ef859	callq	*0x548(%rax)
00000000001ef85f	movapd	%xmm0, %xmm3
00000000001ef863	xorpd	%xmm0, %xmm0
00000000001ef867	movapd	-0x40(%rbp), %xmm10
00000000001ef86d	cmpeqsd	%xmm10, %xmm0
00000000001ef873	blendvpd	%xmm0, 0x517563(%rip), %xmm10
00000000001ef87d	divsd	%xmm10, %xmm3
00000000001ef882	mulsd	-0x30(%rbp), %xmm3
00000000001ef887	movsd	%xmm3, -0x30(%rbp)
00000000001ef88c	testq	%r14, %r14
00000000001ef88f	je	0x1efae3
00000000001ef895	movq	%r15, -0x1b8(%rbp)
00000000001ef89c	movq	%r15, -0x1e0(%rbp)
00000000001ef8a3	movq	%r15, -0x208(%rbp)
00000000001ef8aa	movq	%r15, -0x230(%rbp)
00000000001ef8b1	xorpd	%xmm0, %xmm0
00000000001ef8b5	movupd	%xmm0, -0x228(%rbp)
00000000001ef8bd	movupd	%xmm0, -0x218(%rbp)
00000000001ef8c5	movupd	%xmm0, -0x200(%rbp)
00000000001ef8cd	movupd	%xmm0, -0x1f0(%rbp)
00000000001ef8d5	movupd	%xmm0, -0x1d8(%rbp)
00000000001ef8dd	movupd	%xmm0, -0x1c8(%rbp)
00000000001ef8e5	movq	%r15, -0x138(%rbp)
00000000001ef8ec	movq	%r15, -0x160(%rbp)
00000000001ef8f3	movq	%r15, -0x188(%rbp)
00000000001ef8fa	movq	%r15, -0x1b0(%rbp)
00000000001ef901	movupd	%xmm0, -0x1a8(%rbp)
00000000001ef909	movupd	%xmm0, -0x198(%rbp)
00000000001ef911	movupd	%xmm0, -0x180(%rbp)
00000000001ef919	movupd	%xmm0, -0x170(%rbp)
00000000001ef921	movupd	%xmm0, -0x158(%rbp)
00000000001ef929	movupd	%xmm0, -0x148(%rbp)
00000000001ef931	movq	(%r14), %rax
00000000001ef934	leaq	-0x1b0(%rbp), %rsi
00000000001ef93b	leaq	-0x3c0(%rbp), %r15
00000000001ef942	movq	%r14, %rdi
00000000001ef945	movq	%r15, %rdx
00000000001ef948	movapd	%xmm10, -0x40(%rbp)
00000000001ef94e	callq	*0x508(%rax)
00000000001ef954	movsd	-0x1b0(%rbp), %xmm2
00000000001ef95c	movsd	-0x48(%rbp), %xmm3
00000000001ef961	mulsd	%xmm3, %xmm2
00000000001ef965	movupd	-0x1a8(%rbp), %xmm0
00000000001ef96d	movupd	-0x188(%rbp), %xmm1
00000000001ef975	movapd	-0x130(%rbp), %xmm4
00000000001ef97d	mulpd	%xmm4, %xmm0
00000000001ef981	addsd	%xmm0, %xmm2
00000000001ef985	unpckhpd	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
00000000001ef989	addsd	%xmm2, %xmm0
00000000001ef98d	addsd	-0x198(%rbp), %xmm0
00000000001ef995	movsd	-0x190(%rbp), %xmm2
00000000001ef99d	mulsd	%xmm3, %xmm2
00000000001ef9a1	mulpd	%xmm4, %xmm1
00000000001ef9a5	addsd	%xmm1, %xmm2
00000000001ef9a9	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
00000000001ef9ad	addsd	%xmm2, %xmm1
00000000001ef9b1	addsd	-0x178(%rbp), %xmm1
00000000001ef9b9	mulsd	-0x170(%rbp), %xmm3
00000000001ef9c1	movupd	-0x168(%rbp), %xmm2
00000000001ef9c9	mulpd	%xmm4, %xmm2
00000000001ef9cd	addsd	%xmm2, %xmm3
00000000001ef9d1	unpckhpd	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
00000000001ef9d5	addsd	%xmm3, %xmm2
00000000001ef9d9	addsd	-0x158(%rbp), %xmm2
00000000001ef9e1	addq	$0x18, %rbx
00000000001ef9e5	movsd	-0x30(%rbp), %xmm3
00000000001ef9ea	movsd	-0x80(%rbp), %xmm4
00000000001ef9ef	movsd	-0x78(%rbp), %xmm5
00000000001ef9f4	movsd	-0x70(%rbp), %xmm6
00000000001ef9f9	movsd	-0x68(%rbp), %xmm7
00000000001ef9fe	movsd	-0x60(%rbp), %xmm8
00000000001efa04	movsd	-0x58(%rbp), %xmm9
00000000001efa0a	movsd	-0x50(%rbp), %xmm10
00000000001efa10	movaps	-0x40(%rbp), %xmm11
00000000001efa15	movsd	%xmm11, 0x18(%rsp)
00000000001efa1c	movsd	%xmm10, 0x10(%rsp)
00000000001efa23	movsd	%xmm9, 0x8(%rsp)
00000000001efa2a	movsd	%xmm8, (%rsp)
00000000001efa30	leaq	-0x100(%rbp), %r12
00000000001efa37	movq	%r12, %rdi
00000000001efa3a	movq	%rbx, %rsi
00000000001efa3d	xorl	%edx, %edx
00000000001efa3f	callq	__ZN14PCMatrix44TmplIdE17setTransformationEdddRK6PCQuatIdEddddddddd14TransformOrder ## PCMatrix44Tmpl<double>::setTransformation(double, double, double, PCQuat<double> const&, double, double, double, double, double, double, double, double, double, TransformOrder)
00000000001efa44	movq	(%r14), %rax
00000000001efa47	leaq	-0x230(%rbp), %rbx
00000000001efa4e	movq	%r14, %rdi
00000000001efa51	movq	%rbx, %rsi
00000000001efa54	movq	%r15, %rdx
00000000001efa57	callq	*0x500(%rax)
00000000001efa5d	leaq	-0x2b0(%rbp), %rdi
00000000001efa64	movq	%rbx, %rsi
00000000001efa67	movq	%r12, %rdx
00000000001efa6a	callq	__ZNK14PCMatrix44TmplIdEmlERKS0_ ## PCMatrix44Tmpl<double>::operator*(PCMatrix44Tmpl<double> const&) const
00000000001efa6f	movaps	-0x2b0(%rbp), %xmm0
00000000001efa76	movaps	-0x2a0(%rbp), %xmm1
00000000001efa7d	movaps	-0x290(%rbp), %xmm2
00000000001efa84	movapd	-0x280(%rbp), %xmm3
00000000001efa8c	movaps	%xmm0, -0x100(%rbp)
00000000001efa93	movaps	%xmm1, -0xf0(%rbp)
00000000001efa9a	movaps	%xmm2, -0xe0(%rbp)
00000000001efaa1	movapd	%xmm3, -0xd0(%rbp)
00000000001efaa9	movaps	-0x270(%rbp), %xmm0
00000000001efab0	movaps	%xmm0, -0xc0(%rbp)
00000000001efab7	movaps	-0x260(%rbp), %xmm0
00000000001efabe	movaps	%xmm0, -0xb0(%rbp)
00000000001efac5	movaps	-0x250(%rbp), %xmm0
00000000001efacc	movaps	%xmm0, -0xa0(%rbp)
00000000001efad3	movaps	-0x240(%rbp), %xmm0
00000000001efada	movaps	%xmm0, -0x90(%rbp)
00000000001efae1	jmp	0x1efb4a
00000000001efae3	addq	$0x18, %rbx
00000000001efae7	movsd	-0x80(%rbp), %xmm4
00000000001efaec	movsd	-0x78(%rbp), %xmm5
00000000001efaf1	movsd	-0x70(%rbp), %xmm6
00000000001efaf6	movsd	-0x68(%rbp), %xmm7
00000000001efafb	movsd	-0x60(%rbp), %xmm0
00000000001efb00	movsd	-0x58(%rbp), %xmm9
00000000001efb06	movsd	-0x50(%rbp), %xmm8
00000000001efb0c	movaps	-0x130(%rbp), %xmm1
00000000001efb13	movaps	%xmm1, %xmm2
00000000001efb16	unpckhpd	%xmm1, %xmm2                    ## xmm2 = xmm2[1],xmm1[1]
00000000001efb1a	movsd	%xmm10, 0x18(%rsp)
00000000001efb21	movsd	%xmm8, 0x10(%rsp)
00000000001efb28	movsd	%xmm9, 0x8(%rsp)
00000000001efb2f	movsd	%xmm0, (%rsp)
00000000001efb34	leaq	-0x100(%rbp), %rdi
00000000001efb3b	movsd	-0x48(%rbp), %xmm0
00000000001efb40	movq	%rbx, %rsi
00000000001efb43	xorl	%edx, %edx
00000000001efb45	callq	__ZN14PCMatrix44TmplIdE17setTransformationEdddRK6PCQuatIdEddddddddd14TransformOrder ## PCMatrix44Tmpl<double>::setTransformation(double, double, double, PCQuat<double> const&, double, double, double, double, double, double, double, double, double, TransformOrder)
00000000001efb4a	xorps	%xmm0, %xmm0
00000000001efb4d	movaps	%xmm0, -0x230(%rbp)
00000000001efb54	movaps	0x515865(%rip), %xmm0
00000000001efb5b	movaps	%xmm0, -0x220(%rbp)
00000000001efb62	movq	(%r13), %rax
00000000001efb66	leaq	-0x230(%rbp), %rsi
00000000001efb6d	leaq	-0x3c0(%rbp), %rdx
00000000001efb74	movq	%r13, %rdi
00000000001efb77	callq	*0x5e8(%rax)
00000000001efb7d	movsd	-0x230(%rbp), %xmm2
00000000001efb85	movsd	-0x228(%rbp), %xmm0
00000000001efb8d	movsd	-0x218(%rbp), %xmm6
00000000001efb95	addsd	%xmm0, %xmm6
00000000001efb99	movsd	-0x220(%rbp), %xmm1
00000000001efba1	addsd	%xmm2, %xmm1
00000000001efba5	movsd	-0xc0(%rbp), %xmm5
00000000001efbad	movddup	%xmm2, %xmm3                    ## xmm3 = xmm2[0,0]
00000000001efbb1	mulsd	%xmm5, %xmm2
00000000001efbb5	movsd	-0xb8(%rbp), %xmm4
00000000001efbbd	movddup	%xmm6, %xmm8                    ## xmm8 = xmm6[0,0]
00000000001efbc2	mulsd	%xmm4, %xmm6
00000000001efbc6	movapd	%xmm2, %xmm7
00000000001efbca	addsd	%xmm6, %xmm7
00000000001efbce	xorpd	%xmm9, %xmm9
00000000001efbd3	mulsd	-0xb0(%rbp), %xmm9
00000000001efbdc	addsd	%xmm9, %xmm7
00000000001efbe1	movsd	-0xa8(%rbp), %xmm10
00000000001efbea	addsd	%xmm10, %xmm7
00000000001efbef	mulsd	%xmm1, %xmm5
00000000001efbf3	addsd	%xmm5, %xmm6
00000000001efbf7	addsd	%xmm9, %xmm6
00000000001efbfc	addsd	%xmm10, %xmm6
00000000001efc01	mulsd	%xmm0, %xmm4
00000000001efc05	addsd	%xmm4, %xmm2
00000000001efc09	addsd	%xmm9, %xmm2
00000000001efc0e	addsd	%xmm10, %xmm2
00000000001efc13	addsd	%xmm5, %xmm4
00000000001efc17	addsd	%xmm9, %xmm4
00000000001efc1c	addsd	%xmm10, %xmm4
00000000001efc21	movapd	-0xd0(%rbp), %xmm11
00000000001efc2a	movapd	-0xf0(%rbp), %xmm12
00000000001efc33	movapd	-0xe0(%rbp), %xmm13
00000000001efc3c	movapd	-0x100(%rbp), %xmm10
00000000001efc45	movupd	-0xe8(%rbp), %xmm5
00000000001efc4d	movupd	-0xf8(%rbp), %xmm9
00000000001efc56	movapd	%xmm10, %xmm14
00000000001efc5b	unpcklpd	%xmm13, %xmm14                  ## xmm14 = xmm14[0],xmm13[0]
00000000001efc60	mulpd	%xmm14, %xmm3
00000000001efc65	unpckhpd	%xmm13, %xmm10                  ## xmm10 = xmm10[1],xmm13[1]
00000000001efc6a	mulpd	%xmm8, %xmm10
00000000001efc6f	movapd	%xmm3, %xmm13
00000000001efc74	addpd	%xmm10, %xmm13
00000000001efc79	movapd	%xmm12, %xmm8
00000000001efc7e	unpcklpd	%xmm11, %xmm8                   ## xmm8 = xmm8[0],xmm11[0]
00000000001efc83	xorpd	%xmm15, %xmm15
00000000001efc88	mulpd	%xmm15, %xmm8
00000000001efc8d	addpd	%xmm8, %xmm13
00000000001efc92	unpckhpd	%xmm11, %xmm12                  ## xmm12 = xmm12[1],xmm11[1]
00000000001efc97	movhpd	-0xc8(%rbp), %xmm5              ## xmm5 = xmm5[0],mem[0]
00000000001efc9f	addpd	%xmm13, %xmm12
00000000001efca4	movhpd	-0xd8(%rbp), %xmm9              ## xmm9 = xmm9[0],mem[0]
00000000001efcad	movq	-0x108(%rbp), %rax
00000000001efcb4	movupd	%xmm12, (%rax)
00000000001efcb9	movsd	%xmm7, 0x10(%rax)
00000000001efcbe	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
00000000001efcc2	mulpd	%xmm14, %xmm1
00000000001efcc7	addpd	%xmm1, %xmm10
00000000001efccc	addpd	%xmm8, %xmm10
00000000001efcd1	addpd	%xmm5, %xmm10
00000000001efcd6	movq	-0x110(%rbp), %rax
00000000001efcdd	movupd	%xmm10, (%rax)
00000000001efce2	movsd	%xmm6, 0x10(%rax)
00000000001efce7	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
00000000001efceb	mulpd	%xmm9, %xmm0
00000000001efcf0	addpd	%xmm0, %xmm1
00000000001efcf4	addpd	%xmm8, %xmm1
00000000001efcf9	addpd	%xmm5, %xmm1
00000000001efcfd	movq	-0x118(%rbp), %rax
00000000001efd04	movupd	%xmm1, (%rax)
00000000001efd08	movsd	%xmm4, 0x10(%rax)
00000000001efd0d	addpd	%xmm3, %xmm0
00000000001efd11	addpd	%xmm8, %xmm0
00000000001efd16	addpd	%xmm5, %xmm0
00000000001efd1a	movq	-0x120(%rbp), %rax
00000000001efd21	movupd	%xmm0, (%rax)
00000000001efd25	movsd	%xmm2, 0x10(%rax)
00000000001efd2a	addq	$0x3b8, %rsp                    ## imm = 0x3B8
00000000001efd31	popq	%rbx
00000000001efd32	popq	%r12
00000000001efd34	popq	%r13
00000000001efd36	popq	%r14
00000000001efd38	popq	%r15
00000000001efd3a	popq	%rbp
00000000001efd3b	retq
00000000001efd3c	nopl	(%rax)
