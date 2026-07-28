__ZN14PCMatrix44TmplIdE9leftShearEdd:
000000000004f6c2	pushq	%rbp
000000000004f6c3	movq	%rsp, %rbp
000000000004f6c6	pushq	%rbx
000000000004f6c7	subq	$0x28, %rsp
000000000004f6cb	movapd	%xmm1, %xmm6
000000000004f6cf	movapd	%xmm0, %xmm2
000000000004f6d3	movq	%rdi, %rbx
000000000004f6d6	xorpd	%xmm0, %xmm0
000000000004f6da	ucomisd	%xmm0, %xmm2
000000000004f6de	jne	0x4f6e6
000000000004f6e0	jnp	0x4f76d
000000000004f6e6	ucomisd	%xmm2, %xmm0
000000000004f6ea	jbe	0x4f702
000000000004f6ec	movsd	0xd2eac(%rip), %xmm0
000000000004f6f4	xorpd	%xmm1, %xmm1
000000000004f6f8	addsd	%xmm0, %xmm2
000000000004f6fc	ucomisd	%xmm2, %xmm1
000000000004f700	ja	0x4f6f8
000000000004f702	ucomisd	0xd2e96(%rip), %xmm2
000000000004f70a	movapd	%xmm6, -0x30(%rbp)
000000000004f70f	jbe	0x4f72b
000000000004f711	movsd	0xd5ff7(%rip), %xmm0
000000000004f719	movsd	0xd2e7f(%rip), %xmm1
000000000004f721	addsd	%xmm0, %xmm2
000000000004f725	ucomisd	%xmm1, %xmm2
000000000004f729	ja	0x4f721
000000000004f72b	movapd	%xmm2, %xmm0
000000000004f72f	cmpltsd	0xd5fe0(%rip), %xmm0
000000000004f738	movapd	%xmm2, %xmm1
000000000004f73c	blendvpd	%xmm0, 0xd5fbb(%rip), %xmm1
000000000004f745	movsd	0xd5fd3(%rip), %xmm0
000000000004f74d	cmpltsd	%xmm2, %xmm0
000000000004f752	blendvpd	%xmm0, %xmm1, %xmm2
000000000004f757	movapd	%xmm2, %xmm0
000000000004f75b	callq	0xdebc4                         ## symbol stub for: _tan
000000000004f760	movapd	%xmm0, %xmm2
000000000004f764	movapd	-0x30(%rbp), %xmm6
000000000004f769	xorpd	%xmm0, %xmm0
000000000004f76d	ucomisd	%xmm0, %xmm6
000000000004f771	jne	0x4f775
000000000004f773	jnp	0x4f7f4
000000000004f775	ucomisd	%xmm6, %xmm0
000000000004f779	jbe	0x4f78d
000000000004f77b	movsd	0xd2e1d(%rip), %xmm1
000000000004f783	addsd	%xmm1, %xmm6
000000000004f787	ucomisd	%xmm6, %xmm0
000000000004f78b	ja	0x4f783
000000000004f78d	ucomisd	0xd2e0b(%rip), %xmm6
000000000004f795	movapd	%xmm2, -0x20(%rbp)
000000000004f79a	jbe	0x4f7b6
000000000004f79c	movsd	0xd5f6c(%rip), %xmm0
000000000004f7a4	movsd	0xd2df4(%rip), %xmm1
000000000004f7ac	addsd	%xmm0, %xmm6
000000000004f7b0	ucomisd	%xmm1, %xmm6
000000000004f7b4	ja	0x4f7ac
000000000004f7b6	movapd	%xmm6, %xmm0
000000000004f7ba	cmpltsd	0xd5f55(%rip), %xmm0
000000000004f7c3	movapd	%xmm6, %xmm1
000000000004f7c7	blendvpd	%xmm0, 0xd5f30(%rip), %xmm1
000000000004f7d0	movsd	0xd5f48(%rip), %xmm0
000000000004f7d8	cmpltsd	%xmm6, %xmm0
000000000004f7dd	blendvpd	%xmm0, %xmm1, %xmm6
000000000004f7e2	movapd	%xmm6, %xmm0
000000000004f7e6	callq	0xdebc4                         ## symbol stub for: _tan
000000000004f7eb	movapd	%xmm0, %xmm6
000000000004f7ef	movapd	-0x20(%rbp), %xmm2
000000000004f7f4	movddup	%xmm2, %xmm0                    ## xmm0 = xmm2[0,0]
000000000004f7f8	movupd	(%rbx), %xmm1
000000000004f7fc	movupd	0x10(%rbx), %xmm2
000000000004f801	movupd	0x20(%rbx), %xmm3
000000000004f806	movupd	0x30(%rbx), %xmm4
000000000004f80b	movapd	%xmm0, %xmm5
000000000004f80f	mulpd	%xmm3, %xmm5
000000000004f813	addpd	%xmm1, %xmm5
000000000004f817	movddup	%xmm6, %xmm6                    ## xmm6 = xmm6[0,0]
000000000004f81b	mulpd	%xmm6, %xmm1
000000000004f81f	addpd	%xmm3, %xmm1
000000000004f823	movupd	%xmm1, 0x20(%rbx)
000000000004f828	movupd	%xmm5, (%rbx)
000000000004f82c	mulpd	%xmm4, %xmm0
000000000004f830	addpd	%xmm2, %xmm0
000000000004f834	mulpd	%xmm2, %xmm6
000000000004f838	addpd	%xmm4, %xmm6
000000000004f83c	movupd	%xmm6, 0x30(%rbx)
000000000004f841	movupd	%xmm0, 0x10(%rbx)
000000000004f846	addq	$0x28, %rsp
000000000004f84a	popq	%rbx
000000000004f84b	popq	%rbp
000000000004f84c	retq
