__ZN13OZVectorShapeC2Ev:
0000000000301740	pushq	%rbp
0000000000301741	movq	%rsp, %rbp
0000000000301744	pushq	%r15
0000000000301746	pushq	%r14
0000000000301748	pushq	%r13
000000000030174a	pushq	%r12
000000000030174c	pushq	%rbx
000000000030174d	subq	$0x18, %rsp
0000000000301751	movq	%rdi, %r15
0000000000301754	leaq	0x54c335(%rip), %rax
000000000030175b	movq	%rax, (%rdi)
000000000030175e	leaq	0x8(%rdi), %rax
0000000000301762	movq	%rax, 0x8(%rdi)
0000000000301766	movq	%rax, -0x38(%rbp)
000000000030176a	movq	%rax, 0x10(%rdi)
000000000030176e	movq	$0x0, 0x18(%rdi)
0000000000301776	leaq	0x20(%rdi), %rax
000000000030177a	movq	%rax, 0x20(%rdi)
000000000030177e	movq	%rax, -0x30(%rbp)
0000000000301782	movq	%rax, 0x28(%rdi)
0000000000301786	xorps	%xmm0, %xmm0
0000000000301789	movups	%xmm0, 0x30(%rdi)
000000000030178d	movq	$0x0, 0x40(%rdi)
0000000000301795	movaps	0x403c24(%rip), %xmm1
000000000030179c	movups	%xmm1, 0x48(%rdi)
00000000003017a0	movabsq	$0x3f1a36e2eb1c432d, %rax       ## imm = 0x3F1A36E2EB1C432D
00000000003017aa	movq	%rax, 0x58(%rdi)
00000000003017ae	movabsq	$0x1400000000, %r14             ## imm = 0x1400000000
00000000003017b8	movq	%r14, 0x80(%rdi)
00000000003017bf	movups	%xmm0, 0x60(%rdi)
00000000003017c3	movups	%xmm0, 0x69(%rdi)
00000000003017c7	movq	$0x0, 0x88(%rdi)
00000000003017d2	movl	$0x50, %edi
00000000003017d7	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003017dc	movq	%rax, %rbx
00000000003017df	movq	%rax, 0x88(%r15)
00000000003017e6	movq	%r14, 0x90(%r15)
00000000003017ed	movq	$0x0, 0x98(%r15)
00000000003017f8	movl	$0xa0, %edi
00000000003017fd	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000301802	movq	%rax, %r12
0000000000301805	xorps	%xmm0, %xmm0
0000000000301808	movups	%xmm0, 0x90(%rax)
000000000030180f	movups	%xmm0, 0x80(%rax)
0000000000301816	movups	%xmm0, 0x70(%rax)
000000000030181a	movups	%xmm0, 0x60(%rax)
000000000030181e	movups	%xmm0, 0x50(%rax)
0000000000301822	movups	%xmm0, 0x40(%rax)
0000000000301826	movups	%xmm0, 0x30(%rax)
000000000030182a	movups	%xmm0, 0x20(%rax)
000000000030182e	movups	%xmm0, 0x10(%rax)
0000000000301832	movups	%xmm0, (%rax)
0000000000301835	movq	%rax, 0x98(%r15)
000000000030183c	movq	%r14, 0xa0(%r15)
0000000000301843	movq	$0x0, 0xa8(%r15)
000000000030184e	movl	$0xa0, %edi
0000000000301853	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000301858	movq	%rax, %rbx
000000000030185b	movq	%rax, 0xa8(%r15)
0000000000301862	movq	%r14, 0xb0(%r15)
0000000000301869	movq	$0x0, 0xb8(%r15)
0000000000301874	movl	$0x50, %edi
0000000000301879	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030187e	movq	%rax, %r13
0000000000301881	movq	%rax, 0xb8(%r15)
0000000000301888	movq	%r14, 0xc0(%r15)
000000000030188f	movq	$0x0, 0xc8(%r15)
000000000030189a	movl	$0xd28, %edi                    ## imm = 0xD28
000000000030189f	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003018a4	movq	%rax, %r12
00000000003018a7	movq	$0x14, (%r12)
00000000003018af	movl	__ZN10PTTriangle9idCounterE(%rip), %ecx ## PTTriangle::idCounter
00000000003018b5	addq	$0x8, %r12
00000000003018b9	xorps	%xmm0, %xmm0
00000000003018bc	movups	%xmm0, 0x8(%rax)
00000000003018c0	movq	$0x0, 0x18(%rax)
00000000003018c8	movl	$0x3, 0x24(%rax)
00000000003018cf	movabsq	$0x3ff0000000000000, %rdx       ## imm = 0x3FF0000000000000
00000000003018d9	movq	%rdx, 0xa0(%rax)
00000000003018e0	movq	%rdx, 0x78(%rax)
00000000003018e4	movq	%rdx, 0x50(%rax)
00000000003018e8	movq	%rdx, 0x28(%rax)
00000000003018ec	movups	%xmm0, 0x30(%rax)
00000000003018f0	movups	%xmm0, 0x40(%rax)
00000000003018f4	movups	%xmm0, 0x58(%rax)
00000000003018f8	movups	%xmm0, 0x68(%rax)
00000000003018fc	movups	%xmm0, 0x80(%rax)
0000000000301903	movups	%xmm0, 0x90(%rax)
000000000030190a	leal	0x1(%rcx), %esi
000000000030190d	movl	%esi, 0xa8(%rax)
0000000000301913	movups	%xmm0, 0xac(%rax)
000000000030191a	movups	%xmm0, 0xb8(%rax)
0000000000301921	movl	$0x3, 0xcc(%rax)
000000000030192b	movq	%rdx, 0x148(%rax)
0000000000301932	movq	%rdx, 0x120(%rax)
0000000000301939	movq	%rdx, 0xf8(%rax)
0000000000301940	movq	%rdx, 0xd0(%rax)
0000000000301947	movups	%xmm0, 0xd8(%rax)
000000000030194e	movups	%xmm0, 0xe8(%rax)
0000000000301955	movups	%xmm0, 0x110(%rax)
000000000030195c	movups	%xmm0, 0x100(%rax)
0000000000301963	movups	%xmm0, 0x138(%rax)
000000000030196a	movups	%xmm0, 0x128(%rax)
0000000000301971	leal	0x2(%rcx), %esi
0000000000301974	movl	%esi, 0x150(%rax)
000000000030197a	movups	%xmm0, 0x160(%rax)
0000000000301981	movups	%xmm0, 0x154(%rax)
0000000000301988	movl	$0x3, 0x174(%rax)
0000000000301992	movq	%rdx, 0x1f0(%rax)
0000000000301999	movq	%rdx, 0x1c8(%rax)
00000000003019a0	movq	%rdx, 0x1a0(%rax)
00000000003019a7	movq	%rdx, 0x178(%rax)
00000000003019ae	movups	%xmm0, 0x180(%rax)
00000000003019b5	movups	%xmm0, 0x190(%rax)
00000000003019bc	movups	%xmm0, 0x1b8(%rax)
00000000003019c3	movups	%xmm0, 0x1a8(%rax)
00000000003019ca	movups	%xmm0, 0x1e0(%rax)
00000000003019d1	movups	%xmm0, 0x1d0(%rax)
00000000003019d8	leal	0x3(%rcx), %esi
00000000003019db	movl	%esi, 0x1f8(%rax)
00000000003019e1	movups	%xmm0, 0x208(%rax)
00000000003019e8	movups	%xmm0, 0x1fc(%rax)
00000000003019ef	movl	$0x3, 0x21c(%rax)
00000000003019f9	movq	%rdx, 0x298(%rax)
0000000000301a00	movq	%rdx, 0x270(%rax)
0000000000301a07	movq	%rdx, 0x248(%rax)
0000000000301a0e	movq	%rdx, 0x220(%rax)
0000000000301a15	movups	%xmm0, 0x238(%rax)
0000000000301a1c	movups	%xmm0, 0x228(%rax)
0000000000301a23	movups	%xmm0, 0x260(%rax)
0000000000301a2a	movups	%xmm0, 0x250(%rax)
0000000000301a31	movups	%xmm0, 0x288(%rax)
0000000000301a38	movups	%xmm0, 0x278(%rax)
0000000000301a3f	leal	0x4(%rcx), %esi
0000000000301a42	movl	%esi, 0x2a0(%rax)
0000000000301a48	movups	%xmm0, 0x2b0(%rax)
0000000000301a4f	movups	%xmm0, 0x2a4(%rax)
0000000000301a56	movl	$0x3, 0x2c4(%rax)
0000000000301a60	movq	%rdx, 0x340(%rax)
0000000000301a67	movq	%rdx, 0x318(%rax)
0000000000301a6e	movq	%rdx, 0x2f0(%rax)
0000000000301a75	movq	%rdx, 0x2c8(%rax)
0000000000301a7c	movups	%xmm0, 0x2e0(%rax)
0000000000301a83	movups	%xmm0, 0x2d0(%rax)
0000000000301a8a	movups	%xmm0, 0x308(%rax)
0000000000301a91	movups	%xmm0, 0x2f8(%rax)
0000000000301a98	movups	%xmm0, 0x330(%rax)
0000000000301a9f	movups	%xmm0, 0x320(%rax)
0000000000301aa6	leal	0x5(%rcx), %esi
0000000000301aa9	movl	%esi, 0x348(%rax)
0000000000301aaf	movups	%xmm0, 0x358(%rax)
0000000000301ab6	movups	%xmm0, 0x34c(%rax)
0000000000301abd	movl	$0x3, 0x36c(%rax)
0000000000301ac7	movq	%rdx, 0x3e8(%rax)
0000000000301ace	movq	%rdx, 0x3c0(%rax)
0000000000301ad5	movq	%rdx, 0x398(%rax)
0000000000301adc	movq	%rdx, 0x370(%rax)
0000000000301ae3	movups	%xmm0, 0x388(%rax)
0000000000301aea	movups	%xmm0, 0x378(%rax)
0000000000301af1	movups	%xmm0, 0x3b0(%rax)
0000000000301af8	movups	%xmm0, 0x3a0(%rax)
0000000000301aff	movups	%xmm0, 0x3d8(%rax)
0000000000301b06	movups	%xmm0, 0x3c8(%rax)
0000000000301b0d	leal	0x6(%rcx), %esi
0000000000301b10	movl	%esi, 0x3f0(%rax)
0000000000301b16	movups	%xmm0, 0x400(%rax)
0000000000301b1d	movups	%xmm0, 0x3f4(%rax)
0000000000301b24	movl	$0x3, 0x414(%rax)
0000000000301b2e	movq	%rdx, 0x490(%rax)
0000000000301b35	movq	%rdx, 0x468(%rax)
0000000000301b3c	movq	%rdx, 0x440(%rax)
0000000000301b43	movq	%rdx, 0x418(%rax)
0000000000301b4a	movups	%xmm0, 0x430(%rax)
0000000000301b51	movups	%xmm0, 0x420(%rax)
0000000000301b58	movups	%xmm0, 0x458(%rax)
0000000000301b5f	movups	%xmm0, 0x448(%rax)
0000000000301b66	movups	%xmm0, 0x480(%rax)
0000000000301b6d	movups	%xmm0, 0x470(%rax)
0000000000301b74	leal	0x7(%rcx), %esi
0000000000301b77	movl	%esi, 0x498(%rax)
0000000000301b7d	movups	%xmm0, 0x4a8(%rax)
0000000000301b84	movups	%xmm0, 0x49c(%rax)
0000000000301b8b	movl	$0x3, 0x4bc(%rax)
0000000000301b95	movq	%rdx, 0x538(%rax)
0000000000301b9c	movq	%rdx, 0x510(%rax)
0000000000301ba3	movq	%rdx, 0x4e8(%rax)
0000000000301baa	movq	%rdx, 0x4c0(%rax)
0000000000301bb1	movups	%xmm0, 0x4d8(%rax)
0000000000301bb8	movups	%xmm0, 0x4c8(%rax)
0000000000301bbf	movups	%xmm0, 0x500(%rax)
0000000000301bc6	movups	%xmm0, 0x4f0(%rax)
0000000000301bcd	movups	%xmm0, 0x528(%rax)
0000000000301bd4	movups	%xmm0, 0x518(%rax)
0000000000301bdb	leal	0x8(%rcx), %esi
0000000000301bde	movl	%esi, 0x540(%rax)
0000000000301be4	movups	%xmm0, 0x550(%rax)
0000000000301beb	movups	%xmm0, 0x544(%rax)
0000000000301bf2	movl	$0x3, 0x564(%rax)
0000000000301bfc	movq	%rdx, 0x5e0(%rax)
0000000000301c03	movq	%rdx, 0x5b8(%rax)
0000000000301c0a	movq	%rdx, 0x590(%rax)
0000000000301c11	movq	%rdx, 0x568(%rax)
0000000000301c18	movups	%xmm0, 0x580(%rax)
0000000000301c1f	movups	%xmm0, 0x570(%rax)
0000000000301c26	movups	%xmm0, 0x5a8(%rax)
0000000000301c2d	movups	%xmm0, 0x598(%rax)
0000000000301c34	movups	%xmm0, 0x5d0(%rax)
0000000000301c3b	movups	%xmm0, 0x5c0(%rax)
0000000000301c42	leal	0x9(%rcx), %esi
0000000000301c45	movl	%esi, 0x5e8(%rax)
0000000000301c4b	movups	%xmm0, 0x5f8(%rax)
0000000000301c52	movups	%xmm0, 0x5ec(%rax)
0000000000301c59	movl	$0x3, 0x60c(%rax)
0000000000301c63	movq	%rdx, 0x688(%rax)
0000000000301c6a	movq	%rdx, 0x660(%rax)
0000000000301c71	movq	%rdx, 0x638(%rax)
0000000000301c78	movq	%rdx, 0x610(%rax)
0000000000301c7f	movups	%xmm0, 0x628(%rax)
0000000000301c86	movups	%xmm0, 0x618(%rax)
0000000000301c8d	movups	%xmm0, 0x650(%rax)
0000000000301c94	movups	%xmm0, 0x640(%rax)
0000000000301c9b	movups	%xmm0, 0x678(%rax)
0000000000301ca2	movups	%xmm0, 0x668(%rax)
0000000000301ca9	leal	0xa(%rcx), %esi
0000000000301cac	movl	%esi, 0x690(%rax)
0000000000301cb2	movups	%xmm0, 0x6a0(%rax)
0000000000301cb9	movups	%xmm0, 0x694(%rax)
0000000000301cc0	movl	$0x3, 0x6b4(%rax)
0000000000301cca	movq	%rdx, 0x730(%rax)
0000000000301cd1	movq	%rdx, 0x708(%rax)
0000000000301cd8	movq	%rdx, 0x6e0(%rax)
0000000000301cdf	movq	%rdx, 0x6b8(%rax)
0000000000301ce6	movups	%xmm0, 0x6d0(%rax)
0000000000301ced	movups	%xmm0, 0x6c0(%rax)
0000000000301cf4	movups	%xmm0, 0x6f8(%rax)
0000000000301cfb	movups	%xmm0, 0x6e8(%rax)
0000000000301d02	movups	%xmm0, 0x720(%rax)
0000000000301d09	movups	%xmm0, 0x710(%rax)
0000000000301d10	leal	0xb(%rcx), %esi
0000000000301d13	movl	%esi, 0x738(%rax)
0000000000301d19	movups	%xmm0, 0x748(%rax)
0000000000301d20	movups	%xmm0, 0x73c(%rax)
0000000000301d27	movl	$0x3, 0x75c(%rax)
0000000000301d31	movq	%rdx, 0x7d8(%rax)
0000000000301d38	movq	%rdx, 0x7b0(%rax)
0000000000301d3f	movq	%rdx, 0x788(%rax)
0000000000301d46	movq	%rdx, 0x760(%rax)
0000000000301d4d	movups	%xmm0, 0x778(%rax)
0000000000301d54	movups	%xmm0, 0x768(%rax)
0000000000301d5b	movups	%xmm0, 0x7a0(%rax)
0000000000301d62	movups	%xmm0, 0x790(%rax)
0000000000301d69	movups	%xmm0, 0x7c8(%rax)
0000000000301d70	movups	%xmm0, 0x7b8(%rax)
0000000000301d77	leal	0xc(%rcx), %esi
0000000000301d7a	movl	%esi, 0x7e0(%rax)
0000000000301d80	movups	%xmm0, 0x7f0(%rax)
0000000000301d87	movups	%xmm0, 0x7e4(%rax)
0000000000301d8e	movl	$0x3, 0x804(%rax)
0000000000301d98	movq	%rdx, 0x880(%rax)
0000000000301d9f	movq	%rdx, 0x858(%rax)
0000000000301da6	movq	%rdx, 0x830(%rax)
0000000000301dad	movq	%rdx, 0x808(%rax)
0000000000301db4	movups	%xmm0, 0x820(%rax)
0000000000301dbb	movups	%xmm0, 0x810(%rax)
0000000000301dc2	movups	%xmm0, 0x848(%rax)
0000000000301dc9	movups	%xmm0, 0x838(%rax)
0000000000301dd0	movups	%xmm0, 0x870(%rax)
0000000000301dd7	movups	%xmm0, 0x860(%rax)
0000000000301dde	leal	0xd(%rcx), %esi
0000000000301de1	movl	%esi, 0x888(%rax)
0000000000301de7	movups	%xmm0, 0x898(%rax)
0000000000301dee	movups	%xmm0, 0x88c(%rax)
0000000000301df5	movl	$0x3, 0x8ac(%rax)
0000000000301dff	movq	%rdx, 0x928(%rax)
0000000000301e06	movq	%rdx, 0x900(%rax)
0000000000301e0d	movq	%rdx, 0x8d8(%rax)
0000000000301e14	movq	%rdx, 0x8b0(%rax)
0000000000301e1b	movups	%xmm0, 0x8c8(%rax)
0000000000301e22	movups	%xmm0, 0x8b8(%rax)
0000000000301e29	movups	%xmm0, 0x8f0(%rax)
0000000000301e30	movups	%xmm0, 0x8e0(%rax)
0000000000301e37	movups	%xmm0, 0x918(%rax)
0000000000301e3e	movups	%xmm0, 0x908(%rax)
0000000000301e45	leal	0xe(%rcx), %esi
0000000000301e48	movl	%esi, 0x930(%rax)
0000000000301e4e	movups	%xmm0, 0x940(%rax)
0000000000301e55	movups	%xmm0, 0x934(%rax)
0000000000301e5c	movl	$0x3, 0x954(%rax)
0000000000301e66	movq	%rdx, 0x9d0(%rax)
0000000000301e6d	movq	%rdx, 0x9a8(%rax)
0000000000301e74	movq	%rdx, 0x980(%rax)
0000000000301e7b	movq	%rdx, 0x958(%rax)
0000000000301e82	movups	%xmm0, 0x970(%rax)
0000000000301e89	movups	%xmm0, 0x960(%rax)
0000000000301e90	movups	%xmm0, 0x998(%rax)
0000000000301e97	movups	%xmm0, 0x988(%rax)
0000000000301e9e	movups	%xmm0, 0x9c0(%rax)
0000000000301ea5	movups	%xmm0, 0x9b0(%rax)
0000000000301eac	leal	0xf(%rcx), %esi
0000000000301eaf	movl	%esi, 0x9d8(%rax)
0000000000301eb5	movups	%xmm0, 0x9e8(%rax)
0000000000301ebc	movups	%xmm0, 0x9dc(%rax)
0000000000301ec3	movl	$0x3, 0x9fc(%rax)
0000000000301ecd	movq	%rdx, 0xa78(%rax)
0000000000301ed4	movq	%rdx, 0xa50(%rax)
0000000000301edb	movq	%rdx, 0xa28(%rax)
0000000000301ee2	movq	%rdx, 0xa00(%rax)
0000000000301ee9	movups	%xmm0, 0xa18(%rax)
0000000000301ef0	movups	%xmm0, 0xa08(%rax)
0000000000301ef7	movups	%xmm0, 0xa40(%rax)
0000000000301efe	movups	%xmm0, 0xa30(%rax)
0000000000301f05	movups	%xmm0, 0xa68(%rax)
0000000000301f0c	movups	%xmm0, 0xa58(%rax)
0000000000301f13	leal	0x10(%rcx), %esi
0000000000301f16	movl	%esi, 0xa80(%rax)
0000000000301f1c	movups	%xmm0, 0xa90(%rax)
0000000000301f23	movups	%xmm0, 0xa84(%rax)
0000000000301f2a	movl	$0x3, 0xaa4(%rax)
0000000000301f34	movq	%rdx, 0xb20(%rax)
0000000000301f3b	movq	%rdx, 0xaf8(%rax)
0000000000301f42	movq	%rdx, 0xad0(%rax)
0000000000301f49	movq	%rdx, 0xaa8(%rax)
0000000000301f50	movups	%xmm0, 0xac0(%rax)
0000000000301f57	movups	%xmm0, 0xab0(%rax)
0000000000301f5e	movups	%xmm0, 0xae8(%rax)
0000000000301f65	movups	%xmm0, 0xad8(%rax)
0000000000301f6c	movups	%xmm0, 0xb10(%rax)
0000000000301f73	movups	%xmm0, 0xb00(%rax)
0000000000301f7a	leal	0x11(%rcx), %esi
0000000000301f7d	movl	%esi, 0xb28(%rax)
0000000000301f83	movups	%xmm0, 0xb38(%rax)
0000000000301f8a	movups	%xmm0, 0xb2c(%rax)
0000000000301f91	movl	$0x3, 0xb4c(%rax)
0000000000301f9b	movq	%rdx, 0xbc8(%rax)
0000000000301fa2	movq	%rdx, 0xba0(%rax)
0000000000301fa9	movq	%rdx, 0xb78(%rax)
0000000000301fb0	movq	%rdx, 0xb50(%rax)
0000000000301fb7	movups	%xmm0, 0xb68(%rax)
0000000000301fbe	movups	%xmm0, 0xb58(%rax)
0000000000301fc5	movups	%xmm0, 0xb90(%rax)
0000000000301fcc	movups	%xmm0, 0xb80(%rax)
0000000000301fd3	movups	%xmm0, 0xbb8(%rax)
0000000000301fda	movups	%xmm0, 0xba8(%rax)
0000000000301fe1	leal	0x12(%rcx), %esi
0000000000301fe4	movl	%esi, 0xbd0(%rax)
0000000000301fea	movups	%xmm0, 0xbe0(%rax)
0000000000301ff1	movups	%xmm0, 0xbd4(%rax)
0000000000301ff8	movl	$0x3, 0xbf4(%rax)
0000000000302002	movq	%rdx, 0xc70(%rax)
0000000000302009	movq	%rdx, 0xc48(%rax)
0000000000302010	movq	%rdx, 0xc20(%rax)
0000000000302017	movq	%rdx, 0xbf8(%rax)
000000000030201e	movups	%xmm0, 0xc10(%rax)
0000000000302025	movups	%xmm0, 0xc00(%rax)
000000000030202c	movups	%xmm0, 0xc38(%rax)
0000000000302033	movups	%xmm0, 0xc28(%rax)
000000000030203a	movups	%xmm0, 0xc60(%rax)
0000000000302041	movups	%xmm0, 0xc50(%rax)
0000000000302048	leal	0x13(%rcx), %esi
000000000030204b	movl	%esi, 0xc78(%rax)
0000000000302051	movups	%xmm0, 0xc88(%rax)
0000000000302058	movups	%xmm0, 0xc7c(%rax)
000000000030205f	movl	$0x3, 0xc9c(%rax)
0000000000302069	movq	%rdx, 0xd18(%rax)
0000000000302070	movq	%rdx, 0xcf0(%rax)
0000000000302077	movq	%rdx, 0xcc8(%rax)
000000000030207e	movq	%rdx, 0xca0(%rax)
0000000000302085	movups	%xmm0, 0xcb8(%rax)
000000000030208c	movups	%xmm0, 0xca8(%rax)
0000000000302093	movups	%xmm0, 0xce0(%rax)
000000000030209a	movups	%xmm0, 0xcd0(%rax)
00000000003020a1	movups	%xmm0, 0xd08(%rax)
00000000003020a8	movups	%xmm0, 0xcf8(%rax)
00000000003020af	addl	$0x14, %ecx
00000000003020b2	movl	%ecx, 0xd20(%rax)
00000000003020b8	movl	$0x0, 0xd24(%rax)
00000000003020c2	movl	%ecx, __ZN10PTTriangle9idCounterE(%rip) ## PTTriangle::idCounter
00000000003020c8	movq	%r12, 0xc8(%r15)
00000000003020cf	movq	%r14, 0xd0(%r15)
00000000003020d6	movq	$0x0, 0xd8(%r15)
00000000003020e1	movl	$0x190, %edi                    ## imm = 0x190
00000000003020e6	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003020eb	movq	%rax, %rbx
00000000003020ee	movl	$0x190, %esi                    ## imm = 0x190
00000000003020f3	movq	%rax, %rdi
00000000003020f6	callq	0x6dfcba                        ## symbol stub for: ___bzero
00000000003020fb	movq	%rbx, 0xd8(%r15)
0000000000302102	movq	%r14, 0xe0(%r15)
0000000000302109	movq	$0x0, 0xe8(%r15)
0000000000302114	movl	$0x190, %edi                    ## imm = 0x190
0000000000302119	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030211e	movq	%rax, %r12
0000000000302121	movl	$0x190, %esi                    ## imm = 0x190
0000000000302126	movq	%rax, %rdi
0000000000302129	callq	0x6dfcba                        ## symbol stub for: ___bzero
000000000030212e	movq	%r12, 0xe8(%r15)
0000000000302135	xorps	%xmm0, %xmm0
0000000000302138	movups	%xmm0, 0xf0(%r15)
0000000000302140	addq	$0x18, %rsp
0000000000302144	popq	%rbx
0000000000302145	popq	%r12
0000000000302147	popq	%r13
0000000000302149	popq	%r14
000000000030214b	popq	%r15
000000000030214d	popq	%rbp
000000000030214e	retq
000000000030214f	movq	%rax, %r14
0000000000302152	movq	%rbx, %rdi
0000000000302155	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030215a	movq	$0x0, 0xd8(%r15)
0000000000302165	movq	0xc8(%r15), %r12
000000000030216c	testq	%r12, %r12
000000000030216f	jne	0x302201
0000000000302175	movq	$0x0, 0xc8(%r15)
0000000000302180	movq	0xb8(%r15), %r13
0000000000302187	testq	%r13, %r13
000000000030218a	jne	0x30222d
0000000000302190	movq	$0x0, 0xb8(%r15)
000000000030219b	movq	0xa8(%r15), %rbx
00000000003021a2	testq	%rbx, %rbx
00000000003021a5	jne	0x302255
00000000003021ab	movq	$0x0, 0xa8(%r15)
00000000003021b6	movq	0x98(%r15), %r12
00000000003021bd	testq	%r12, %r12
00000000003021c0	jne	0x30227d
00000000003021c6	movq	$0x0, 0x98(%r15)
00000000003021d1	movq	0x88(%r15), %rbx
00000000003021d8	testq	%rbx, %rbx
00000000003021db	jne	0x3022a5
00000000003021e1	movq	$0x0, 0x88(%r15)
00000000003021ec	movq	0x60(%r15), %rdi
00000000003021f0	testq	%rdi, %rdi
00000000003021f3	jne	0x3022c1
00000000003021f9	jmp	0x3022cf
00000000003021fe	movq	%rax, %r14
0000000000302201	addq	$-0x8, %r12
0000000000302205	movq	%r12, %rdi
0000000000302208	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030220d	movq	$0x0, 0xc8(%r15)
0000000000302218	movq	0xb8(%r15), %r13
000000000030221f	testq	%r13, %r13
0000000000302222	je	0x302190
0000000000302228	jmp	0x30222d
000000000030222a	movq	%rax, %r14
000000000030222d	movq	%r13, %rdi
0000000000302230	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000302235	movq	$0x0, 0xb8(%r15)
0000000000302240	movq	0xa8(%r15), %rbx
0000000000302247	testq	%rbx, %rbx
000000000030224a	je	0x3021ab
0000000000302250	jmp	0x302255
0000000000302252	movq	%rax, %r14
0000000000302255	movq	%rbx, %rdi
0000000000302258	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030225d	movq	$0x0, 0xa8(%r15)
0000000000302268	movq	0x98(%r15), %r12
000000000030226f	testq	%r12, %r12
0000000000302272	je	0x3021c6
0000000000302278	jmp	0x30227d
000000000030227a	movq	%rax, %r14
000000000030227d	movq	%r12, %rdi
0000000000302280	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000302285	movq	$0x0, 0x98(%r15)
0000000000302290	movq	0x88(%r15), %rbx
0000000000302297	testq	%rbx, %rbx
000000000030229a	je	0x3021e1
00000000003022a0	jmp	0x3022a5
00000000003022a2	movq	%rax, %r14
00000000003022a5	movq	%rbx, %rdi
00000000003022a8	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003022ad	movq	$0x0, 0x88(%r15)
00000000003022b8	movq	0x60(%r15), %rdi
00000000003022bc	testq	%rdi, %rdi
00000000003022bf	je	0x3022cf
00000000003022c1	movq	%rdi, 0x68(%r15)
00000000003022c5	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003022ca	jmp	0x3022cf
00000000003022cc	movq	%rax, %r14
00000000003022cf	movq	-0x30(%rbp), %rdi
00000000003022d3	callq	__ZNSt3__14listIP25OZDefaultOverlayComponentNS_9allocatorIS2_EEED1Ev ## std::__1::list<OZDefaultOverlayComponent*, std::__1::allocator<OZDefaultOverlayComponent*>>::~list()
00000000003022d8	movq	-0x38(%rbp), %rdi
00000000003022dc	callq	__ZNSt3__14listIP25OZDefaultOverlayComponentNS_9allocatorIS2_EEED1Ev ## std::__1::list<OZDefaultOverlayComponent*, std::__1::allocator<OZDefaultOverlayComponent*>>::~list()
00000000003022e1	movq	%r14, %rdi
00000000003022e4	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000003022e9	nopl	(%rax)
