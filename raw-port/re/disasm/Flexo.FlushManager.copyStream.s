__ZN12FlushManager10copyStreamEP18FFThumbnailRequestP18FFStreamVideoCacheRi:
0000000000ab6850	pushq	%rbp
0000000000ab6851	movq	%rsp, %rbp
0000000000ab6854	pushq	%r15
0000000000ab6856	pushq	%r14
0000000000ab6858	pushq	%r13
0000000000ab685a	pushq	%r12
0000000000ab685c	pushq	%rbx
0000000000ab685d	subq	$0x138, %rsp                    ## imm = 0x138
0000000000ab6864	movq	%rcx, %r13
0000000000ab6867	movq	%rdx, -0xf0(%rbp)
0000000000ab686e	movq	%rsi, %r12
0000000000ab6871	movq	%rdi, %rbx
0000000000ab6874	movq	0x110ca4d(%rip), %rsi
0000000000ab687b	movq	0xe36e3e(%rip), %r14            ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6882	movq	%r12, %rdi
0000000000ab6885	callq	*%r14
0000000000ab6888	movq	%rax, %r15
0000000000ab688b	movq	%rbx, -0x30(%rbp)
0000000000ab688f	movq	%rbx, %rdi
0000000000ab6892	callq	0x14973b0                       ## symbol stub for: __ZNSt3__15mutex4lockEv
0000000000ab6897	movq	0x1108c7a(%rip), %rsi
0000000000ab689e	movq	%r15, %rdi
0000000000ab68a1	callq	*%r14
0000000000ab68a4	movq	%r13, -0xe8(%rbp)
0000000000ab68ab	movq	%rax, %rdi
0000000000ab68ae	callq	_FFModelLockFromRef
0000000000ab68b3	movq	%rax, %rbx
0000000000ab68b6	movq	0x1101f5b(%rip), %rsi
0000000000ab68bd	movq	%rax, %rdi
0000000000ab68c0	callq	*0xe36dfa(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab68c6	movq	%rbx, -0x68(%rbp)
0000000000ab68ca	movq	-0x30(%rbp), %rax
0000000000ab68ce	movq	0x48(%rax), %r13
0000000000ab68d2	cmpq	0x40(%rax), %r13
0000000000ab68d6	je	0xab6b75
0000000000ab68dc	movq	0x1104a35(%rip), %rax
0000000000ab68e3	movq	%rax, -0x38(%rbp)
0000000000ab68e7	movq	0x1114c5a(%rip), %rax
0000000000ab68ee	movq	%rax, -0x50(%rbp)
0000000000ab68f2	movq	0x11200bf(%rip), %rax
0000000000ab68f9	movq	%rax, -0x48(%rbp)
0000000000ab68fd	movq	0x11318fc(%rip), %rax
0000000000ab6904	movq	%rax, -0x60(%rbp)
0000000000ab6908	movq	0x1106cc9(%rip), %rax
0000000000ab690f	movq	%rax, -0x40(%rbp)
0000000000ab6913	movq	0x1102996(%rip), %rax
0000000000ab691a	movq	%rax, -0x58(%rbp)
0000000000ab691e	movq	0x110233b(%rip), %rax
0000000000ab6925	movq	%rax, -0x70(%rbp)
0000000000ab6929	movq	0x1131780(%rip), %rax
0000000000ab6930	movq	%rax, -0x78(%rbp)
0000000000ab6934	movq	0x111ab45(%rip), %rax
0000000000ab693b	movq	%rax, -0xb8(%rbp)
0000000000ab6942	movq	0x11026b7(%rip), %rax
0000000000ab6949	movq	%rax, -0xf8(%rbp)
0000000000ab6950	jmp	0xab6972
0000000000ab6952	nopw	%cs:(%rax,%rax)
0000000000ab6960	addq	$-0x40, %r13
0000000000ab6964	movq	-0x30(%rbp), %rax
0000000000ab6968	cmpq	0x40(%rax), %r13
0000000000ab696c	je	0xab6b75
0000000000ab6972	cmpq	%r15, -0x30(%r13)
0000000000ab6976	jne	0xab6960
0000000000ab6978	movl	-0x8(%r13), %ebx
0000000000ab697c	movq	%r12, %rdi
0000000000ab697f	movq	-0x38(%rbp), %rsi
0000000000ab6983	callq	*0xe36d37(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6989	cmpl	%eax, %ebx
0000000000ab698b	jne	0xab6960
0000000000ab698d	movq	-0x40(%r13), %r14
0000000000ab6991	movq	-0x18(%r13), %rax
0000000000ab6995	movq	%rax, -0x100(%rbp)
0000000000ab699c	movups	-0x28(%r13), %xmm0
0000000000ab69a1	movaps	%xmm0, -0x110(%rbp)
0000000000ab69a8	movq	$0x0, -0xc0(%rbp)
0000000000ab69b3	movq	%r12, %rdi
0000000000ab69b6	movq	-0x50(%rbp), %rsi
0000000000ab69ba	callq	*0xe36d00(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab69c0	movl	%eax, %ebx
0000000000ab69c2	movq	%r12, %rdi
0000000000ab69c5	movq	-0x48(%rbp), %rsi
0000000000ab69c9	callq	*0xe36cf1(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab69cf	movl	$0x0, (%rsp)
0000000000ab69d6	movq	%r14, %rdi
0000000000ab69d9	movq	-0x60(%rbp), %rsi
0000000000ab69dd	movl	%ebx, %edx
0000000000ab69df	movl	%eax, %ecx
0000000000ab69e1	leaq	-0xc0(%rbp), %r8
0000000000ab69e8	xorl	%r9d, %r9d
0000000000ab69eb	callq	*0xe36ccf(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab69f1	movq	%r14, %rdi
0000000000ab69f4	movq	-0x40(%rbp), %rsi
0000000000ab69f8	callq	*0xe36cc2(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab69fe	movq	%rax, %r14
0000000000ab6a01	movq	%rax, %rdi
0000000000ab6a04	movq	-0x58(%rbp), %rsi
0000000000ab6a08	callq	*0xe36cb2(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6a0e	testq	%rax, %rax
0000000000ab6a11	je	0xab6a40
0000000000ab6a13	leaq	-0xe0(%rbp), %rdi
0000000000ab6a1a	movq	%rax, %rsi
0000000000ab6a1d	movq	-0x70(%rbp), %rdx
0000000000ab6a21	callq	0x1497986                       ## symbol stub for: _objc_msgSend_stret
0000000000ab6a26	testq	%r12, %r12
0000000000ab6a29	je	0xab6a5a
0000000000ab6a2b	leaq	-0xb0(%rbp), %rdi
0000000000ab6a32	movq	%r12, %rsi
0000000000ab6a35	movq	-0x78(%rbp), %rdx
0000000000ab6a39	callq	0x1497986                       ## symbol stub for: _objc_msgSend_stret
0000000000ab6a3e	jmp	0xab6a72
0000000000ab6a40	xorps	%xmm0, %xmm0
0000000000ab6a43	movaps	%xmm0, -0xe0(%rbp)
0000000000ab6a4a	movq	$0x0, -0xd0(%rbp)
0000000000ab6a55	testq	%r12, %r12
0000000000ab6a58	jne	0xab6a2b
0000000000ab6a5a	xorps	%xmm0, %xmm0
0000000000ab6a5d	movaps	%xmm0, -0x90(%rbp)
0000000000ab6a64	movaps	%xmm0, -0xa0(%rbp)
0000000000ab6a6b	movaps	%xmm0, -0xb0(%rbp)
0000000000ab6a72	movq	-0xc0(%rbp), %rdx
0000000000ab6a79	movq	-0xa0(%rbp), %rax
0000000000ab6a80	movq	%rax, 0x28(%rsp)
0000000000ab6a85	movaps	-0xb0(%rbp), %xmm0
0000000000ab6a8c	movups	%xmm0, 0x18(%rsp)
0000000000ab6a91	movq	-0xd0(%rbp), %rax
0000000000ab6a98	movq	%rax, 0x10(%rsp)
0000000000ab6a9d	movaps	-0xe0(%rbp), %xmm0
0000000000ab6aa4	movups	%xmm0, (%rsp)
0000000000ab6aa8	movq	%r14, %rdi
0000000000ab6aab	movq	-0xb8(%rbp), %rsi
0000000000ab6ab2	callq	*0xe36c08(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6ab8	movq	%rax, %r14
0000000000ab6abb	movq	-0xc0(%rbp), %rdi
0000000000ab6ac2	callq	*0xe36c40(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab6ac8	testq	%r14, %r14
0000000000ab6acb	je	0xab6ae5
0000000000ab6acd	leaq	-0xb0(%rbp), %rdi
0000000000ab6ad4	movq	%r14, %rsi
0000000000ab6ad7	movq	-0xf8(%rbp), %rdx
0000000000ab6ade	callq	0x1497986                       ## symbol stub for: _objc_msgSend_stret
0000000000ab6ae3	jmp	0xab6afd
0000000000ab6ae5	xorps	%xmm0, %xmm0
0000000000ab6ae8	movaps	%xmm0, -0x90(%rbp)
0000000000ab6aef	movaps	%xmm0, -0xa0(%rbp)
0000000000ab6af6	movaps	%xmm0, -0xb0(%rbp)
0000000000ab6afd	movq	-0x100(%rbp), %rax
0000000000ab6b04	movq	%rax, 0x40(%rsp)
0000000000ab6b09	movaps	-0x110(%rbp), %xmm0
0000000000ab6b10	movups	%xmm0, 0x30(%rsp)
0000000000ab6b15	movaps	-0xb0(%rbp), %xmm0
0000000000ab6b1c	movaps	-0xa0(%rbp), %xmm1
0000000000ab6b23	movaps	-0x90(%rbp), %xmm2
0000000000ab6b2a	movups	%xmm2, 0x20(%rsp)
0000000000ab6b2f	movups	%xmm1, 0x10(%rsp)
0000000000ab6b34	movups	%xmm0, (%rsp)
0000000000ab6b38	callq	0x1495172                       ## symbol stub for: _CMTimeRangeContainsTime
0000000000ab6b3d	movl	%eax, %ebx
0000000000ab6b3f	movq	%r14, %rdi
0000000000ab6b42	callq	*0xe36bc0(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab6b48	testb	%bl, %bl
0000000000ab6b4a	je	0xab6960
0000000000ab6b50	testq	%r12, %r12
0000000000ab6b53	je	0xab7090
0000000000ab6b59	leaq	-0xb0(%rbp), %rdi
0000000000ab6b60	movq	%r12, %rsi
0000000000ab6b63	movq	-0x78(%rbp), %rdx
0000000000ab6b67	movq	-0x68(%rbp), %r14
0000000000ab6b6b	callq	0x1497986                       ## symbol stub for: _objc_msgSend_stret
0000000000ab6b70	jmp	0xab70ac
0000000000ab6b75	movq	%r15, %rdi
0000000000ab6b78	callq	*0xe36b92(%rip)                 ## literal pool symbol address: _objc_retain
0000000000ab6b7e	movq	%rax, -0x60(%rbp)
0000000000ab6b82	testq	%r12, %r12
0000000000ab6b85	je	0xab6b9f
0000000000ab6b87	movq	0x1131522(%rip), %rdx
0000000000ab6b8e	leaq	-0xb0(%rbp), %rdi
0000000000ab6b95	movq	%r12, %rsi
0000000000ab6b98	callq	0x1497986                       ## symbol stub for: _objc_msgSend_stret
0000000000ab6b9d	jmp	0xab6bb7
0000000000ab6b9f	xorps	%xmm0, %xmm0
0000000000ab6ba2	movaps	%xmm0, -0x90(%rbp)
0000000000ab6ba9	movaps	%xmm0, -0xa0(%rbp)
0000000000ab6bb0	movaps	%xmm0, -0xb0(%rbp)
0000000000ab6bb7	movq	-0xa0(%rbp), %rax
0000000000ab6bbe	movq	%rax, -0xd0(%rbp)
0000000000ab6bc5	movaps	-0xb0(%rbp), %xmm0
0000000000ab6bcc	movaps	%xmm0, -0xe0(%rbp)
0000000000ab6bd3	movq	0x110473e(%rip), %r13
0000000000ab6bda	movq	%r12, %rdi
0000000000ab6bdd	movq	%r13, %rsi
0000000000ab6be0	callq	*0xe36ada(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6be6	movl	%eax, -0x40(%rbp)
0000000000ab6be9	leaq	_OBJC_CLASS_$_FFAnchoredProviderOptions(%rip), %rbx
0000000000ab6bf0	movq	0x1106751(%rip), %rsi
0000000000ab6bf7	movq	%r12, %rdi
0000000000ab6bfa	callq	*0xe36ac0(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6c00	movq	0x1108491(%rip), %rsi
0000000000ab6c07	movq	%rbx, %rdi
0000000000ab6c0a	movq	%rax, %rdx
0000000000ab6c0d	callq	*0xe36aad(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6c13	movq	0x110c736(%rip), %rsi
0000000000ab6c1a	movq	%r15, %rdi
0000000000ab6c1d	movq	%rax, %rdx
0000000000ab6c20	callq	*0xe36a9a(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6c26	movq	%rax, %rbx
0000000000ab6c29	movq	0x1102660(%rip), %rsi
0000000000ab6c30	movq	%rax, %rdi
0000000000ab6c33	callq	*0xe36a87(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6c39	movq	%rax, %r14
0000000000ab6c3c	movq	0x110266d(%rip), %rsi
0000000000ab6c43	movq	%rax, %rdi
0000000000ab6c46	callq	*0xe36a74(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6c4c	movq	0x1131465(%rip), %rsi
0000000000ab6c53	movq	%rax, %rdi
0000000000ab6c56	movq	%r15, %rdx
0000000000ab6c59	callq	*0xe36a61(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6c5f	movq	%rax, %r15
0000000000ab6c62	movq	%r14, -0x50(%rbp)
0000000000ab6c66	movq	%rbx, -0x58(%rbp)
0000000000ab6c6a	leaq	_OBJC_CLASS_$_FFStreamVideoOptions(%rip), %rdi
0000000000ab6c71	callq	0x14978fc                       ## symbol stub for: _objc_alloc
0000000000ab6c76	movq	%rax, %rbx
0000000000ab6c79	movq	%r12, %rdi
0000000000ab6c7c	movq	%r13, %rsi
0000000000ab6c7f	callq	*0xe36a3b(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6c85	movq	0x1131434(%rip), %rsi
0000000000ab6c8c	movq	%rbx, %rdi
0000000000ab6c8f	movq	%r15, %rdx
0000000000ab6c92	movq	-0xf0(%rbp), %rcx
0000000000ab6c99	movl	%eax, %r8d
0000000000ab6c9c	callq	*0xe36a1e(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6ca2	movq	%rax, -0x38(%rbp)
0000000000ab6ca6	movq	%r15, -0x48(%rbp)
0000000000ab6caa	leaq	_OBJC_CLASS_$_Flexo(%rip), %rdi
0000000000ab6cb1	movq	0x110cbf0(%rip), %rsi
0000000000ab6cb8	callq	*0xe36a02(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6cbe	leaq	_OBJC_CLASS_$_FFOnDiskRenderInfo(%rip), %rbx
0000000000ab6cc5	testb	%al, %al
0000000000ab6cc7	je	0xab6cdb
0000000000ab6cc9	movq	0x1122ee0(%rip), %rsi
0000000000ab6cd0	movq	%rbx, %rdi
0000000000ab6cd3	callq	*0xe369e7(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6cd9	jmp	0xab6cfd
0000000000ab6cdb	movq	%r12, %rdi
0000000000ab6cde	movq	%r13, %rsi
0000000000ab6ce1	callq	*0xe369d9(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6ce7	movq	0x11313da(%rip), %rsi
0000000000ab6cee	movq	%rbx, %rdi
0000000000ab6cf1	movq	-0x48(%rbp), %rdx
0000000000ab6cf5	movl	%eax, %ecx
0000000000ab6cf7	callq	*0xe369c3(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6cfd	movq	%rax, %r15
0000000000ab6d00	movq	0x1105a69(%rip), %rsi
0000000000ab6d07	movq	-0x50(%rbp), %rdi
0000000000ab6d0b	xorl	%edx, %edx
0000000000ab6d0d	xorl	%ecx, %ecx
0000000000ab6d0f	movq	-0x38(%rbp), %r8
0000000000ab6d13	callq	*0xe369a7(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6d19	movq	%rax, %rbx
0000000000ab6d1c	leaq	_OBJC_CLASS_$_FFSegmentStoreRef(%rip), %rdi
0000000000ab6d23	callq	0x14978fc                       ## symbol stub for: _objc_alloc
0000000000ab6d28	movq	%rax, %r14
0000000000ab6d2b	leaq	_OBJC_CLASS_$_FFProject(%rip), %r12
0000000000ab6d32	movq	0x110689f(%rip), %rsi
0000000000ab6d39	movq	%rbx, %rdi
0000000000ab6d3c	callq	*0xe3697e(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6d42	movq	0x1107857(%rip), %rsi
0000000000ab6d49	movq	%rax, %rdi
0000000000ab6d4c	callq	*0xe3696e(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6d52	movq	0x1102fa7(%rip), %rsi
0000000000ab6d59	movq	%rax, %rdi
0000000000ab6d5c	callq	*0xe3695e(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6d62	movq	0x1122e4f(%rip), %rsi
0000000000ab6d69	movq	%r12, %rdi
0000000000ab6d6c	movq	%rax, %rdx
0000000000ab6d6f	callq	*0xe3694b(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6d75	movq	0x1112434(%rip), %rsi
0000000000ab6d7c	movq	%r14, %rdi
0000000000ab6d7f	movq	%rax, %rdx
0000000000ab6d82	movq	%r15, %rcx
0000000000ab6d85	callq	*0xe36935(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6d8b	movq	-0x60(%rbp), %rsi
0000000000ab6d8f	movq	-0x30(%rbp), %rdx
0000000000ab6d93	movq	0x40(%rdx), %rdi
0000000000ab6d97	movq	0x48(%rdx), %r13
0000000000ab6d9b	movq	%r13, %r14
0000000000ab6d9e	subq	%rdi, %r14
0000000000ab6da1	movq	%r14, %r15
0000000000ab6da4	sarq	$0x6, %r15
0000000000ab6da8	movq	-0xe8(%rbp), %rcx
0000000000ab6daf	movl	%r15d, (%rcx)
0000000000ab6db2	movq	0x50(%rdx), %r8
0000000000ab6db6	cmpq	%r8, %r13
0000000000ab6db9	jae	0xab6dfe
0000000000ab6dbb	movq	%rbx, (%r13)
0000000000ab6dbf	movq	%rax, 0x8(%r13)
0000000000ab6dc3	movq	%rsi, 0x10(%r13)
0000000000ab6dc7	movaps	-0xe0(%rbp), %xmm0
0000000000ab6dce	movups	%xmm0, 0x18(%r13)
0000000000ab6dd3	movq	-0xd0(%rbp), %rax
0000000000ab6dda	movq	%rax, 0x28(%r13)
0000000000ab6dde	movq	$0x0, 0x30(%r13)
0000000000ab6de6	movl	-0x40(%rbp), %eax
0000000000ab6de9	movl	%eax, 0x38(%r13)
0000000000ab6ded	movl	$0x0, 0x3c(%r13)
0000000000ab6df5	addq	$0x40, %r13
0000000000ab6df9	jmp	0xab6ef6
0000000000ab6dfe	leaq	0x1(%r15), %rcx
0000000000ab6e02	movq	%rcx, %rdx
0000000000ab6e05	shrq	$0x3a, %rdx
0000000000ab6e09	jne	0xab70f0
0000000000ab6e0f	movq	%rax, -0xb8(%rbp)
0000000000ab6e16	movabsq	$0x3ffffffffffffff, %rdx        ## imm = 0x3FFFFFFFFFFFFFF
0000000000ab6e20	movq	%rdi, -0x78(%rbp)
0000000000ab6e24	subq	%rdi, %r8
0000000000ab6e27	movq	%r8, %r12
0000000000ab6e2a	sarq	$0x5, %r12
0000000000ab6e2e	cmpq	%rcx, %r12
0000000000ab6e31	cmovbeq	%rcx, %r12
0000000000ab6e35	movabsq	$0x7fffffffffffffc0, %rcx       ## imm = 0x7FFFFFFFFFFFFFC0
0000000000ab6e3f	cmpq	%rcx, %r8
0000000000ab6e42	cmovaeq	%rdx, %r12
0000000000ab6e46	cmpq	%rdx, %r12
0000000000ab6e49	ja	0xab70f7
0000000000ab6e4f	movq	%rsi, %r13
0000000000ab6e52	shlq	$0x6, %r12
0000000000ab6e56	movq	%r12, %rdi
0000000000ab6e59	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000ab6e5e	movq	-0xb8(%rbp), %rdx
0000000000ab6e65	movq	%rbx, %rcx
0000000000ab6e68	leaq	(%rax,%r14), %rbx
0000000000ab6e6c	addq	%rax, %r12
0000000000ab6e6f	movq	%rcx, -0x70(%rbp)
0000000000ab6e73	movq	%rcx, (%rax,%r14)
0000000000ab6e77	movq	%rdx, 0x8(%rax,%r14)
0000000000ab6e7c	movq	%r13, 0x10(%rax,%r14)
0000000000ab6e81	movaps	-0xe0(%rbp), %xmm0
0000000000ab6e88	movups	%xmm0, 0x18(%rax,%r14)
0000000000ab6e8e	movq	-0xd0(%rbp), %rcx
0000000000ab6e95	movq	%rcx, 0x28(%rax,%r14)
0000000000ab6e9a	movq	$0x0, 0x30(%rax,%r14)
0000000000ab6ea3	movl	-0x40(%rbp), %ecx
0000000000ab6ea6	movl	%ecx, 0x38(%rax,%r14)
0000000000ab6eab	movl	$0x0, 0x3c(%rax,%r14)
0000000000ab6eb4	leaq	(%rax,%r14), %r13
0000000000ab6eb8	addq	$0x40, %r13
0000000000ab6ebc	shlq	$0x6, %r15
0000000000ab6ec0	subq	%r15, %rbx
0000000000ab6ec3	movq	%rbx, %rdi
0000000000ab6ec6	movq	-0x78(%rbp), %r15
0000000000ab6eca	movq	%r15, %rsi
0000000000ab6ecd	movq	%r14, %rdx
0000000000ab6ed0	callq	0x14978ba                       ## symbol stub for: _memcpy
0000000000ab6ed5	movq	-0x30(%rbp), %rax
0000000000ab6ed9	movq	%rbx, 0x40(%rax)
0000000000ab6edd	movq	%r13, 0x48(%rax)
0000000000ab6ee1	movq	%r12, 0x50(%rax)
0000000000ab6ee5	testq	%r15, %r15
0000000000ab6ee8	je	0xab6ef2
0000000000ab6eea	movq	%r15, %rdi
0000000000ab6eed	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000ab6ef2	movq	-0x70(%rbp), %rbx
0000000000ab6ef6	movq	-0x30(%rbp), %rax
0000000000ab6efa	movq	%r13, 0x48(%rax)
0000000000ab6efe	movq	-0x38(%rbp), %rdi
0000000000ab6f02	callq	*0xe36800(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab6f08	movq	-0x58(%rbp), %rdi
0000000000ab6f0c	callq	*0xe367f6(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab6f12	movq	-0x50(%rbp), %rdi
0000000000ab6f16	callq	*0xe367ec(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab6f1c	movq	-0x48(%rbp), %rdi
0000000000ab6f20	callq	*0xe367e2(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab6f26	movq	%rbx, %rdi
0000000000ab6f29	callq	*0xe367e1(%rip)                 ## literal pool symbol address: _objc_retain
0000000000ab6f2f	movq	%rax, %r15
0000000000ab6f32	xorl	%ebx, %ebx
0000000000ab6f34	movq	-0x68(%rbp), %rdi
0000000000ab6f38	movq	0x11018f9(%rip), %rsi
0000000000ab6f3f	callq	*0xe3677b(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6f45	movq	%r15, -0x58(%rbp)
0000000000ab6f49	testb	%bl, %bl
0000000000ab6f4b	jne	0xab70e9
0000000000ab6f51	movq	-0x30(%rbp), %rax
0000000000ab6f55	movq	0x40(%rax), %r15
0000000000ab6f59	cmpq	0x48(%rax), %r15
0000000000ab6f5d	je	0xab7071
0000000000ab6f63	movq	0x1101836(%rip), %rax
0000000000ab6f6a	movq	%rax, -0x50(%rbp)
0000000000ab6f6e	movq	0x111966b(%rip), %rax
0000000000ab6f75	movq	%rax, -0x48(%rbp)
0000000000ab6f79	movq	0x1131270(%rip), %rax
0000000000ab6f80	movq	%rax, -0x60(%rbp)
0000000000ab6f84	movq	0x113126d(%rip), %rax
0000000000ab6f8b	movq	%rax, -0x40(%rbp)
0000000000ab6f8f	jmp	0xab6fb2
0000000000ab6f91	nopw	%cs:(%rax,%rax)
0000000000ab6fa0	addq	$0x40, %r15
0000000000ab6fa4	movq	-0x30(%rbp), %rax
0000000000ab6fa8	cmpq	0x48(%rax), %r15
0000000000ab6fac	je	0xab7071
0000000000ab6fb2	movq	(%r15), %rdi
0000000000ab6fb5	testq	%rdi, %rdi
0000000000ab6fb8	je	0xab6fa0
0000000000ab6fba	movq	-0x50(%rbp), %rsi
0000000000ab6fbe	callq	*0xe366fc(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6fc4	cmpq	$0x1, %rax
0000000000ab6fc8	jne	0xab6fa0
0000000000ab6fca	movq	(%r15), %r14
0000000000ab6fcd	movq	0x8(%r15), %r13
0000000000ab6fd1	movq	0x30(%r15), %rbx
0000000000ab6fd5	movq	%rbx, %rdi
0000000000ab6fd8	movq	-0x48(%rbp), %rsi
0000000000ab6fdc	callq	*0xe366de(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab6fe2	movq	%rax, -0x38(%rbp)
0000000000ab6fe6	testq	%r13, %r13
0000000000ab6fe9	je	0xab7026
0000000000ab6feb	testq	%r14, %r14
0000000000ab6fee	je	0xab7026
0000000000ab6ff0	movq	%rdx, %r12
0000000000ab6ff3	movq	%rdx, %rax
0000000000ab6ff6	orq	-0x38(%rbp), %rax
0000000000ab6ffa	je	0xab7026
0000000000ab6ffc	movq	%rbx, %rdi
0000000000ab6fff	movq	-0x60(%rbp), %rsi
0000000000ab7003	callq	*0xe366b7(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab7009	xorl	%r8d, %r8d
0000000000ab700c	testb	$0x2, %al
0000000000ab700e	sete	%r8b
0000000000ab7012	movq	%r13, %rdi
0000000000ab7015	movq	-0x40(%rbp), %rsi
0000000000ab7019	movq	-0x38(%rbp), %rdx
0000000000ab701d	movq	%r12, %rcx
0000000000ab7020	callq	*0xe3669a(%rip)                 ## Objc message: -[%rdi dispatchRequest:addThumbnailToEvent:]
0000000000ab7026	movq	(%r15), %rdi
0000000000ab7029	callq	*0xe366d9(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab702f	movq	$0x0, (%r15)
0000000000ab7036	movq	0x8(%r15), %rdi
0000000000ab703a	callq	*0xe366c8(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab7040	movq	$0x0, 0x8(%r15)
0000000000ab7048	movq	0x10(%r15), %rdi
0000000000ab704c	callq	*0xe366b6(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab7052	movq	$0x0, 0x10(%r15)
0000000000ab705a	movq	0x30(%r15), %rdi
0000000000ab705e	callq	*0xe366a4(%rip)                 ## literal pool symbol address: _objc_release
0000000000ab7064	movq	$0x0, 0x30(%r15)
0000000000ab706c	jmp	0xab6fa0
0000000000ab7071	movq	-0x30(%rbp), %rdi
0000000000ab7075	callq	0x14973b6                       ## symbol stub for: __ZNSt3__15mutex6unlockEv
0000000000ab707a	movq	-0x58(%rbp), %rax
0000000000ab707e	addq	$0x138, %rsp                    ## imm = 0x138
0000000000ab7085	popq	%rbx
0000000000ab7086	popq	%r12
0000000000ab7088	popq	%r13
0000000000ab708a	popq	%r14
0000000000ab708c	popq	%r15
0000000000ab708e	popq	%rbp
0000000000ab708f	retq
0000000000ab7090	xorps	%xmm0, %xmm0
0000000000ab7093	movaps	%xmm0, -0x90(%rbp)
0000000000ab709a	movaps	%xmm0, -0xa0(%rbp)
0000000000ab70a1	movaps	%xmm0, -0xb0(%rbp)
0000000000ab70a8	movq	-0x68(%rbp), %r14
0000000000ab70ac	leaq	-0x28(%r13), %rax
0000000000ab70b0	movq	-0xa0(%rbp), %rcx
0000000000ab70b7	movq	%rcx, 0x10(%rax)
0000000000ab70bb	movaps	-0xb0(%rbp), %xmm0
0000000000ab70c2	movups	%xmm0, (%rax)
0000000000ab70c5	movq	-0x40(%r13), %rdi
0000000000ab70c9	callq	*0xe36641(%rip)                 ## literal pool symbol address: _objc_retain
0000000000ab70cf	movq	%rax, %r15
0000000000ab70d2	movq	-0xe8(%rbp), %rax
0000000000ab70d9	movl	$0xffffffff, (%rax)             ## imm = 0xFFFFFFFF
0000000000ab70df	xorl	%ebx, %ebx
0000000000ab70e1	movq	%r14, %rdi
0000000000ab70e4	jmp	0xab6f38
0000000000ab70e9	callq	0x1497944                       ## symbol stub for: _objc_exception_rethrow
0000000000ab70ee	jmp	0xab70fc
0000000000ab70f0	callq	__ZNSt3__16vectorI12StreamRecordNS_9allocatorIS1_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<StreamRecord, std::__1::allocator<StreamRecord>>::__throw_length_error[abi:nqe210106]()
0000000000ab70f5	jmp	0xab70fc
0000000000ab70f7	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
0000000000ab70fc	ud2
0000000000ab70fe	jmp	0xab712f
0000000000ab7100	jmp	0xab712f
0000000000ab7102	jmp	0xab712f
0000000000ab7104	jmp	0xab712f
0000000000ab7106	movq	%rax, %r14
0000000000ab7109	jmp	0xab7112
0000000000ab710b	movq	%rax, %r14
0000000000ab710e	testb	%bl, %bl
0000000000ab7110	je	0xab7144
0000000000ab7112	callq	0x1497938                       ## symbol stub for: _objc_end_catch
0000000000ab7117	jmp	0xab7144
0000000000ab7119	movq	%rax, %rdi
0000000000ab711c	callq	___clang_call_terminate
0000000000ab7121	jmp	0xab7141
0000000000ab7123	jmp	0xab712f
0000000000ab7125	jmp	0xab712f
0000000000ab7127	jmp	0xab7141
0000000000ab7129	jmp	0xab712f
0000000000ab712b	jmp	0xab712f
0000000000ab712d	jmp	0xab712f
0000000000ab712f	movq	%rax, %rdi
0000000000ab7132	callq	0x1497926                       ## symbol stub for: _objc_begin_catch
0000000000ab7137	movb	$0x1, %bl
0000000000ab7139	xorl	%r15d, %r15d
0000000000ab713c	jmp	0xab6f34
0000000000ab7141	movq	%rax, %r14
0000000000ab7144	movq	-0x30(%rbp), %rdi
0000000000ab7148	callq	0x14973b6                       ## symbol stub for: __ZNSt3__15mutex6unlockEv
0000000000ab714d	movq	%r14, %rdi
0000000000ab7150	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000ab7155	nopw	%cs:(%rax,%rax)
