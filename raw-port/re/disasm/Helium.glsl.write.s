__ZN4glslL5writeER8string_tPK15HGShaderBindingPK8HGLimitsjS7_jPKcbjib:
00000000000c18b0	pushq	%rbp
00000000000c18b1	movq	%rsp, %rbp
00000000000c18b4	pushq	%r15
00000000000c18b6	pushq	%r14
00000000000c18b8	pushq	%r13
00000000000c18ba	pushq	%r12
00000000000c18bc	pushq	%rbx
00000000000c18bd	subq	$0x58, %rsp
00000000000c18c1	movl	%r9d, -0x68(%rbp)
00000000000c18c5	movl	%r8d, -0x44(%rbp)
00000000000c18c9	movl	%edx, -0x58(%rbp)
00000000000c18cc	movq	%rsi, -0x60(%rbp)
00000000000c18d0	movq	%rdi, %r15
00000000000c18d3	leaq	0x21(%rcx), %rsi
00000000000c18d7	movzbl	0x21(%rcx), %eax
00000000000c18db	cmpb	$0x23, %al
00000000000c18dd	sete	%bl
00000000000c18e0	jne	0xc190f
00000000000c18e2	movq	%rcx, %r14
00000000000c18e5	movq	%rsi, %rdi
00000000000c18e8	leaq	0x8237d0(%rip), %rsi            ## literal pool for: "#ifndef GL_ES"
00000000000c18ef	movl	$0xd, %edx
00000000000c18f4	movq	%rdi, %r12
00000000000c18f7	callq	0x3c5618                        ## symbol stub for: _strncmp
00000000000c18fc	testl	%eax, %eax
00000000000c18fe	je	0xc191f
00000000000c1900	movl	$0x0, -0x64(%rbp)
00000000000c1907	movq	%r12, %rsi
00000000000c190a	jmp	0xc19c2
00000000000c190f	movl	%ebx, -0x64(%rbp)
00000000000c1912	testb	%al, %al
00000000000c1914	jne	0xc19c2
00000000000c191a	jmp	0xc322a
00000000000c191f	movl	%ebx, -0x64(%rbp)
00000000000c1922	cmpq	$0x21, 0x8(%r15)
00000000000c1927	jne	0xc19ae
00000000000c192d	movq	0x10(%r15), %rax
00000000000c1931	testq	%rax, %rax
00000000000c1934	je	0xc195e
00000000000c1936	cmpq	$0x7a, (%rax)
00000000000c193a	ja	0xc196b
00000000000c193c	movq	0x10(%rax), %rdi
00000000000c1940	movl	$0x100, %esi                    ## imm = 0x100
00000000000c1945	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c194a	movq	0x10(%r15), %rcx
00000000000c194e	movq	%rax, 0x10(%rcx)
00000000000c1952	movq	$0x100, (%rcx)                  ## imm = 0x100
00000000000c1959	movq	%rax, (%r15)
00000000000c195c	jmp	0xc196b
00000000000c195e	movl	$0x7a, %esi
00000000000c1963	movq	%r15, %rdi
00000000000c1966	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c196b	addq	$0x59, 0x8(%r15)
00000000000c1970	movq	(%r15), %rax
00000000000c1973	movups	0x49(%r12), %xmm0
00000000000c1979	movups	%xmm0, 0x6a(%rax)
00000000000c197d	movups	0x40(%r12), %xmm0
00000000000c1983	movups	%xmm0, 0x61(%rax)
00000000000c1987	movups	(%r12), %xmm0
00000000000c198c	movups	0x10(%r12), %xmm1
00000000000c1992	movups	0x20(%r12), %xmm2
00000000000c1998	movups	0x30(%r12), %xmm3
00000000000c199e	movups	%xmm3, 0x51(%rax)
00000000000c19a2	movups	%xmm2, 0x41(%rax)
00000000000c19a6	movups	%xmm1, 0x31(%rax)
00000000000c19aa	movups	%xmm0, 0x21(%rax)
00000000000c19ae	movzbl	0x7a(%r14), %eax
00000000000c19b3	addq	$0x7a, %r14
00000000000c19b7	movq	%r14, %rsi
00000000000c19ba	testb	%al, %al
00000000000c19bc	je	0xc322a
00000000000c19c2	movq	$0x0, -0x70(%rbp)
00000000000c19ca	movl	$0x0, -0x54(%rbp)
00000000000c19d1	movq	%rsi, %r13
00000000000c19d4	movq	$0x0, -0x38(%rbp)
00000000000c19dc	movq	%r15, -0x50(%rbp)
00000000000c19e0	decq	%r13
00000000000c19e3	movq	%r13, %r12
00000000000c19e6	nopw	%cs:(%rax,%rax)
00000000000c19f0	movzbl	0x1(%r12), %eax
00000000000c19f6	incq	%r12
00000000000c19f9	leal	-0x21(%rax), %ecx
00000000000c19fc	cmpb	$-0x21, %cl
00000000000c19ff	ja	0xc19f0
00000000000c1a01	jmp	0xc1a23
00000000000c1a03	nopw	%cs:(%rax,%rax)
00000000000c1a10	xorl	%ecx, %ecx
00000000000c1a12	cmpb	$0xa, %al
00000000000c1a14	sete	%cl
00000000000c1a17	leaq	(%r12,%rcx), %rsi
00000000000c1a1b	movzbl	(%r12,%rcx), %eax
00000000000c1a20	movq	%rsi, %r12
00000000000c1a23	movzbl	%al, %ecx
00000000000c1a26	cmpb	$0x2f, %cl
00000000000c1a29	jne	0xc1b80
00000000000c1a2f	cmpb	$0x2f, 0x1(%r12)
00000000000c1a35	jne	0xc2020
00000000000c1a3b	movq	%r12, %r14
00000000000c1a3e	subq	%rsi, %r14
00000000000c1a41	movq	0x8(%r15), %rcx
00000000000c1a45	movq	0x10(%r15), %rax
00000000000c1a49	leaq	(%rcx,%r14), %rbx
00000000000c1a4d	testq	%rax, %rax
00000000000c1a50	je	0xc1a70
00000000000c1a52	cmpq	(%rax), %rbx
00000000000c1a55	jae	0xc1af0
00000000000c1a5b	movq	(%r15), %r13
00000000000c1a5e	jmp	0xc1b32
00000000000c1a63	nopw	%cs:(%rax,%rax)
00000000000c1a70	movq	%rsi, -0x30(%rbp)
00000000000c1a74	leaq	0xff(%rbx), %r13
00000000000c1a7b	andq	$-0x100, %r13
00000000000c1a82	movl	$0x18, %edi
00000000000c1a87	movq	%rcx, -0x40(%rbp)
00000000000c1a8b	callq	0x3c5426                        ## symbol stub for: _malloc
00000000000c1a90	movq	%rax, %r15
00000000000c1a93	movl	$0x1, %edi
00000000000c1a98	movq	%r13, -0x78(%rbp)
00000000000c1a9c	movq	%r13, %rsi
00000000000c1a9f	callq	0x3c5066                        ## symbol stub for: _calloc
00000000000c1aa4	movq	-0x40(%rbp), %rcx
00000000000c1aa8	movq	%rax, %r13
00000000000c1aab	movq	%rax, 0x10(%r15)
00000000000c1aaf	movq	$0x1, 0x8(%r15)
00000000000c1ab7	testq	%rcx, %rcx
00000000000c1aba	je	0xc1ad3
00000000000c1abc	movq	-0x50(%rbp), %rax
00000000000c1ac0	movq	(%rax), %rsi
00000000000c1ac3	movq	%r13, %rdi
00000000000c1ac6	movq	-0x40(%rbp), %rdx
00000000000c1aca	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c1acf	movq	-0x40(%rbp), %rcx
00000000000c1ad3	movq	-0x78(%rbp), %rax
00000000000c1ad7	movq	%rax, (%r15)
00000000000c1ada	movq	-0x50(%rbp), %rax
00000000000c1ade	movq	%r15, 0x10(%rax)
00000000000c1ae2	movq	%r13, (%rax)
00000000000c1ae5	movq	%rax, %r15
00000000000c1ae8	movq	-0x30(%rbp), %rsi
00000000000c1aec	jmp	0xc1b32
00000000000c1aee	nop
00000000000c1af0	addq	$0xff, %rbx
00000000000c1af7	andq	$-0x100, %rbx
00000000000c1afe	movq	0x10(%rax), %rdi
00000000000c1b02	movq	%rsi, %r13
00000000000c1b05	movq	%rbx, %rsi
00000000000c1b08	movq	%rcx, %r15
00000000000c1b0b	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c1b10	movq	%r15, %rcx
00000000000c1b13	movq	-0x50(%rbp), %r15
00000000000c1b17	movq	%r13, %rsi
00000000000c1b1a	movq	%rax, %r13
00000000000c1b1d	movq	0x10(%r15), %rax
00000000000c1b21	movq	%r13, 0x10(%rax)
00000000000c1b25	movq	%rbx, (%rax)
00000000000c1b28	movq	%r13, (%r15)
00000000000c1b2b	movq	0x8(%r15), %rbx
00000000000c1b2f	addq	%r14, %rbx
00000000000c1b32	movq	%rbx, 0x8(%r15)
00000000000c1b36	addq	%rcx, %r13
00000000000c1b39	movq	%r13, %rdi
00000000000c1b3c	movq	%r14, %rdx
00000000000c1b3f	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c1b44	movzbl	(%r12), %eax
00000000000c1b49	testl	%eax, %eax
00000000000c1b4b	je	0xc1a10
00000000000c1b51	nopw	%cs:(%rax,%rax)
00000000000c1b60	cmpl	$0xa, %eax
00000000000c1b63	je	0xc1a10
00000000000c1b69	incq	%r12
00000000000c1b6c	movzbl	(%r12), %eax
00000000000c1b71	testl	%eax, %eax
00000000000c1b73	jne	0xc1b60
00000000000c1b75	jmp	0xc1a10
00000000000c1b7a	nopw	(%rax,%rax)
00000000000c1b80	testl	%ecx, %ecx
00000000000c1b82	je	0xc322a
00000000000c1b88	cmpl	$0x76, %ecx
00000000000c1b8b	jne	0xc1c00
00000000000c1b8d	movq	%rsi, %r14
00000000000c1b90	leaq	0x1(%r12), %rbx
00000000000c1b95	movl	$0x8, %edx
00000000000c1b9a	movq	%rbx, %rdi
00000000000c1b9d	leaq	0x823529(%rip), %rsi            ## literal pool for: "ec4 main"
00000000000c1ba4	callq	0x3c5618                        ## symbol stub for: _strncmp
00000000000c1ba9	testl	%eax, %eax
00000000000c1bab	je	0xc1d14
00000000000c1bb1	movl	$0x8, %edx
00000000000c1bb6	movq	%rbx, %rdi
00000000000c1bb9	leaq	0x823516(%rip), %rsi            ## literal pool for: "oid main"
00000000000c1bc0	callq	0x3c5618                        ## symbol stub for: _strncmp
00000000000c1bc5	testl	%eax, %eax
00000000000c1bc7	je	0xc1d89
00000000000c1bcd	leaq	__ZL5ctype(%rip), %rcx          ## ctype
00000000000c1bd4	movq	%r14, %rsi
00000000000c1bd7	nopw	(%rax,%rax)
00000000000c1be0	movzbl	0x1(%r12), %eax
00000000000c1be6	incq	%r12
00000000000c1be9	testb	$0x40, (%rcx,%rax,2)
00000000000c1bed	jne	0xc1be0
00000000000c1bef	jmp	0xc222e
00000000000c1bf4	nopw	%cs:(%rax,%rax)
00000000000c1c00	cmpb	$0x0, -0x44(%rbp)
00000000000c1c04	jne	0xc1c74
00000000000c1c06	cmpb	$0x74, %al
00000000000c1c08	jne	0xc1c74
00000000000c1c0a	movq	%rsi, -0x30(%rbp)
00000000000c1c0e	leaq	0x1(%r12), %rbx
00000000000c1c13	movl	$0x17, %edx
00000000000c1c18	movq	%rbx, %rdi
00000000000c1c1b	leaq	0x8234d1(%rip), %rsi            ## literal pool for: "exture2DRect(hg_Texture"
00000000000c1c22	callq	0x3c5618                        ## symbol stub for: _strncmp
00000000000c1c27	testl	%eax, %eax
00000000000c1c29	je	0xc1dfe
00000000000c1c2f	movl	$0x13, %edx
00000000000c1c34	movq	%rbx, %rdi
00000000000c1c37	leaq	0x8234cd(%rip), %rsi            ## literal pool for: "exture2D(hg_Texture"
00000000000c1c3e	callq	0x3c5618                        ## symbol stub for: _strncmp
00000000000c1c43	testl	%eax, %eax
00000000000c1c45	je	0xc1e32
00000000000c1c4b	leaq	__ZL5ctype(%rip), %rcx          ## ctype
00000000000c1c52	movq	-0x30(%rbp), %rsi
00000000000c1c56	nopw	%cs:(%rax,%rax)
00000000000c1c60	movzbl	0x1(%r12), %eax
00000000000c1c66	incq	%r12
00000000000c1c69	testb	$0x40, (%rcx,%rax,2)
00000000000c1c6d	jne	0xc1c60
00000000000c1c6f	jmp	0xc222e
00000000000c1c74	leal	-0x67(%rcx), %edx
00000000000c1c77	cmpl	$0x16, %edx
00000000000c1c7a	ja	0xc1f83
00000000000c1c80	movq	%rsi, %rdi
00000000000c1c83	leaq	0x15b2(%rip), %rsi
00000000000c1c8a	movslq	(%rsi,%rdx,4), %rdx
00000000000c1c8e	addq	%rsi, %rdx
00000000000c1c91	movq	%rdi, %rsi
00000000000c1c94	jmpq	*%rdx
00000000000c1c96	cmpb	$0x6c, 0x1(%r12)
00000000000c1c9c	jne	0xc2020
00000000000c1ca2	cmpb	$0x5f, 0x2(%r12)
00000000000c1ca8	jne	0xc2020
00000000000c1cae	movq	%rsi, -0x30(%rbp)
00000000000c1cb2	leaq	0x3(%r12), %rbx
00000000000c1cb7	movl	$0x9, %edx
00000000000c1cbc	movq	%rbx, %rdi
00000000000c1cbf	leaq	0x823469(%rip), %rsi            ## literal pool for: "TexCoord["
00000000000c1cc6	callq	0x3c5618                        ## symbol stub for: _strncmp
00000000000c1ccb	testl	%eax, %eax
00000000000c1ccd	je	0xc28b7
00000000000c1cd3	cmpb	$0x0, -0x44(%rbp)
00000000000c1cd7	je	0xc1cf5
00000000000c1cd9	movl	$0x9, %edx
00000000000c1cde	movq	%rbx, %rdi
00000000000c1ce1	leaq	0x81b150(%rip), %rsi            ## literal pool for: "FragColor"
00000000000c1ce8	callq	0x3c5618                        ## symbol stub for: _strncmp
00000000000c1ced	testl	%eax, %eax
00000000000c1cef	je	0xc2ae9
00000000000c1cf5	leaq	__ZL5ctype(%rip), %rcx          ## ctype
00000000000c1cfc	movq	-0x30(%rbp), %rsi
00000000000c1d00	movzbl	0x1(%r12), %eax
00000000000c1d06	incq	%r12
00000000000c1d09	testb	$0x40, (%rcx,%rax,2)
00000000000c1d0d	jne	0xc1d00
00000000000c1d0f	jmp	0xc222e
00000000000c1d14	movq	%r12, %r13
00000000000c1d17	addq	$0x9, %r13
00000000000c1d1b	cmpb	$0x0, -0x44(%rbp)
00000000000c1d1f	je	0xc1df1
00000000000c1d25	movq	%r13, %rbx
00000000000c1d28	subq	%r14, %rbx
00000000000c1d2b	movq	0x8(%r15), %rdi
00000000000c1d2f	movq	0x10(%r15), %rax
00000000000c1d33	movq	%r15, %r12
00000000000c1d36	leaq	(%rdi,%rbx), %r15
00000000000c1d3a	testq	%rax, %rax
00000000000c1d3d	je	0xc20b6
00000000000c1d43	movq	%r14, %rsi
00000000000c1d46	cmpq	(%rax), %r15
00000000000c1d49	jb	0xc20cc
00000000000c1d4f	addq	$0xff, %r15
00000000000c1d56	andq	$-0x100, %r15
00000000000c1d5d	movq	%rdi, -0x40(%rbp)
00000000000c1d61	movq	0x10(%rax), %rdi
00000000000c1d65	movq	%r15, %rsi
00000000000c1d68	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c1d6d	movq	-0x40(%rbp), %rdi
00000000000c1d71	movq	%r14, %rsi
00000000000c1d74	movq	0x10(%r12), %rcx
00000000000c1d79	movq	%rax, 0x10(%rcx)
00000000000c1d7d	movq	%r15, (%rcx)
00000000000c1d80	movq	%rax, (%r12)
00000000000c1d84	jmp	0xc20cc
00000000000c1d89	cmpb	$0x0, -0x44(%rbp)
00000000000c1d8d	movq	%r14, %rsi
00000000000c1d90	je	0xc1e20
00000000000c1d96	movq	%r12, %rbx
00000000000c1d99	subq	%rsi, %rbx
00000000000c1d9c	movq	0x8(%r15), %r13
00000000000c1da0	movq	0x10(%r15), %rax
00000000000c1da4	movq	%r15, %rdx
00000000000c1da7	leaq	(%rbx,%r13), %r15
00000000000c1dab	testq	%rax, %rax
00000000000c1dae	je	0xc2243
00000000000c1db4	cmpq	(%rax), %r15
00000000000c1db7	jb	0xc2256
00000000000c1dbd	addq	$0xff, %r15
00000000000c1dc4	andq	$-0x100, %r15
00000000000c1dcb	movq	0x10(%rax), %rdi
00000000000c1dcf	movq	%r15, %rsi
00000000000c1dd2	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c1dd7	movq	-0x50(%rbp), %rdx
00000000000c1ddb	movq	%r14, %rsi
00000000000c1dde	movq	0x10(%rdx), %rcx
00000000000c1de2	movq	%rax, 0x10(%rcx)
00000000000c1de6	movq	%r15, (%rcx)
00000000000c1de9	movq	%rax, (%rdx)
00000000000c1dec	jmp	0xc2256
00000000000c1df1	movq	%r14, %rsi
00000000000c1df4	movzbl	(%r13), %eax
00000000000c1df9	jmp	0xc2236
00000000000c1dfe	movzbl	0x18(%r12), %eax
00000000000c1e04	leal	-0x3a(%rax), %ecx
00000000000c1e07	cmpb	$-0xa, %cl
00000000000c1e0a	jae	0xc2064
00000000000c1e10	xorl	%r14d, %r14d
00000000000c1e13	movq	-0x38(%rbp), %rdx
00000000000c1e17	movq	-0x30(%rbp), %rsi
00000000000c1e1b	jmp	0xc208c
00000000000c1e20	addq	$0x9, %r12
00000000000c1e24	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000000c1e29	movq	%rax, -0x70(%rbp)
00000000000c1e2d	jmp	0xc222e
00000000000c1e32	movzbl	0x14(%r12), %eax
00000000000c1e38	leal	-0x3a(%rax), %ecx
00000000000c1e3b	cmpb	$-0xa, %cl
00000000000c1e3e	movq	-0x30(%rbp), %rsi
00000000000c1e42	jae	0xc21cb
00000000000c1e48	xorl	%r14d, %r14d
00000000000c1e4b	movq	-0x38(%rbp), %rdx
00000000000c1e4f	jmp	0xc21fc
00000000000c1e54	movq	-0x70(%rbp), %rax
00000000000c1e58	xorl	$0x1, %eax
00000000000c1e5b	movl	-0x54(%rbp), %ecx
00000000000c1e5e	orl	%ecx, %eax
00000000000c1e60	jne	0xc2226
00000000000c1e66	movq	%r12, %r13
00000000000c1e69	incq	%r13
00000000000c1e6c	movq	%r13, %rbx
00000000000c1e6f	subq	%rsi, %rbx
00000000000c1e72	movq	0x8(%r15), %r14
00000000000c1e76	movq	0x10(%r15), %rax
00000000000c1e7a	movq	%r15, %r12
00000000000c1e7d	leaq	(%r14,%rbx), %r15
00000000000c1e81	testq	%rax, %rax
00000000000c1e84	je	0xc25c0
00000000000c1e8a	cmpq	(%rax), %r15
00000000000c1e8d	jb	0xc25d4
00000000000c1e93	addq	$0xff, %r15
00000000000c1e9a	andq	$-0x100, %r15
00000000000c1ea1	movq	0x10(%rax), %rdi
00000000000c1ea5	movq	%rsi, -0x30(%rbp)
00000000000c1ea9	movq	%r15, %rsi
00000000000c1eac	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c1eb1	movq	-0x30(%rbp), %rsi
00000000000c1eb5	movq	0x10(%r12), %rcx
00000000000c1eba	movq	%rax, 0x10(%rcx)
00000000000c1ebe	movq	%r15, (%rcx)
00000000000c1ec1	movq	%rax, (%r12)
00000000000c1ec5	jmp	0xc25d4
00000000000c1eca	cmpb	$0x67, 0x1(%r12)
00000000000c1ed0	jne	0xc2020
00000000000c1ed6	cmpb	$0x5f, 0x2(%r12)
00000000000c1edc	jne	0xc2020
00000000000c1ee2	movq	%rsi, -0x30(%rbp)
00000000000c1ee6	leaq	0x3(%r12), %rbx
00000000000c1eeb	movl	$0x7, %edx
00000000000c1ef0	movq	%rbx, %rdi
00000000000c1ef3	leaq	0x81b0dd(%rip), %rsi            ## literal pool for: "Texture"
00000000000c1efa	callq	0x3c5618                        ## symbol stub for: _strncmp
00000000000c1eff	testl	%eax, %eax
00000000000c1f01	je	0xc291c
00000000000c1f07	movl	$0x8, %edx
00000000000c1f0c	movq	%rbx, %rdi
00000000000c1f0f	leaq	0x81aeba(%rip), %rsi            ## literal pool for: "TexCoord"
00000000000c1f16	callq	0x3c5618                        ## symbol stub for: _strncmp
00000000000c1f1b	testl	%eax, %eax
00000000000c1f1d	je	0xc2989
00000000000c1f23	movl	$0xc, %edx
00000000000c1f28	movq	%rbx, %rdi
00000000000c1f2b	leaq	0x81b0ad(%rip), %rsi            ## literal pool for: "ProgramLocal"
00000000000c1f32	callq	0x3c5618                        ## symbol stub for: _strncmp
00000000000c1f37	testl	%eax, %eax
00000000000c1f39	je	0xc2a15
00000000000c1f3f	leaq	__ZL5ctype(%rip), %rcx          ## ctype
00000000000c1f46	movq	-0x30(%rbp), %rsi
00000000000c1f4a	movzbl	0x1(%r12), %eax
00000000000c1f50	incq	%r12
00000000000c1f53	testb	$0x40, (%rcx,%rax,2)
00000000000c1f57	jne	0xc1f4a
00000000000c1f59	jmp	0xc222e
00000000000c1f5e	movl	-0x54(%rbp), %eax
00000000000c1f61	decl	%eax
00000000000c1f63	jne	0xc1f7b
00000000000c1f65	movq	-0x70(%rbp), %rcx
00000000000c1f69	cmpl	$-0x1, %ecx
00000000000c1f6c	je	0xc3205
00000000000c1f72	cmpl	$0x1, %ecx
00000000000c1f75	je	0xc31ce
00000000000c1f7b	movl	%eax, -0x54(%rbp)
00000000000c1f7e	jmp	0xc222b
00000000000c1f83	cmpb	$0x0, -0x44(%rbp)
00000000000c1f87	je	0xc2020
00000000000c1f8d	cmpb	$0x6d, %al
00000000000c1f8f	jne	0xc2020
00000000000c1f95	cmpb	$0x61, 0x1(%r12)
00000000000c1f9b	jne	0xc2020
00000000000c1fa1	cmpb	$0x69, 0x2(%r12)
00000000000c1fa7	jne	0xc2020
00000000000c1fa9	cmpb	$0x6e, 0x3(%r12)
00000000000c1faf	jne	0xc2020
00000000000c1fb1	movq	%r12, %r13
00000000000c1fb4	addq	$0x4, %r13
00000000000c1fb8	movq	%r13, %rbx
00000000000c1fbb	subq	%rsi, %rbx
00000000000c1fbe	movq	0x8(%r15), %r14
00000000000c1fc2	movq	0x10(%r15), %rax
00000000000c1fc6	movq	%r15, %r12
00000000000c1fc9	leaq	(%r14,%rbx), %r15
00000000000c1fcd	testq	%rax, %rax
00000000000c1fd0	je	0xc2ba9
00000000000c1fd6	cmpq	(%rax), %r15
00000000000c1fd9	jb	0xc2bbd
00000000000c1fdf	addq	$0xff, %r15
00000000000c1fe6	andq	$-0x100, %r15
00000000000c1fed	movq	0x10(%rax), %rdi
00000000000c1ff1	movq	%rsi, -0x30(%rbp)
00000000000c1ff5	movq	%r15, %rsi
00000000000c1ff8	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c1ffd	movq	-0x30(%rbp), %rsi
00000000000c2001	movq	0x10(%r12), %rcx
00000000000c2006	movq	%rax, 0x10(%rcx)
00000000000c200a	movq	%r15, (%rcx)
00000000000c200d	movq	%rax, (%r12)
00000000000c2011	jmp	0xc2bbd
00000000000c2016	nopw	%cs:(%rax,%rax)
00000000000c2020	addb	$-0x30, %al
00000000000c2022	cmpb	$0xa, %al
00000000000c2024	jb	0xc222b
00000000000c202a	leaq	__ZL5ctype(%rip), %rax          ## ctype
00000000000c2031	movzbl	(%rax,%rcx,2), %eax
00000000000c2035	andb	$0x40, %al
00000000000c2037	je	0xc222b
00000000000c203d	leaq	__ZL5ctype(%rip), %rcx          ## ctype
00000000000c2044	nopw	%cs:(%rax,%rax)
00000000000c2050	movzbl	0x1(%r12), %eax
00000000000c2056	incq	%r12
00000000000c2059	testb	$0x40, (%rcx,%rax,2)
00000000000c205d	jne	0xc2050
00000000000c205f	jmp	0xc222e
00000000000c2064	leaq	0x18(%r12), %r14
00000000000c2069	xorl	%edx, %edx
00000000000c206b	movq	-0x30(%rbp), %rsi
00000000000c206f	nop
00000000000c2070	leal	(%rdx,%rdx,4), %ecx
00000000000c2073	movzbl	%al, %eax
00000000000c2076	leal	(%rax,%rcx,2), %edx
00000000000c2079	addl	$-0x30, %edx
00000000000c207c	movzbl	0x1(%r14), %eax
00000000000c2081	incq	%r14
00000000000c2084	leal	-0x3a(%rax), %ecx
00000000000c2087	cmpb	$-0xb, %cl
00000000000c208a	ja	0xc2070
00000000000c208c	movq	%rdx, -0x38(%rbp)
00000000000c2090	movl	-0x68(%rbp), %eax
00000000000c2093	testl	%eax, %eax
00000000000c2095	je	0xc213c
00000000000c209b	movq	-0x38(%rbp), %rcx
00000000000c209f	btl	%ecx, %eax
00000000000c20a2	movl	%ecx, %edx
00000000000c20a4	leaq	__ZL5ctype(%rip), %rcx          ## ctype
00000000000c20ab	jb	0xc2162
00000000000c20b1	jmp	0xc2690
00000000000c20b6	movq	%rdi, -0x40(%rbp)
00000000000c20ba	movq	%r12, %rdi
00000000000c20bd	movq	%r15, %rsi
00000000000c20c0	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c20c5	movq	-0x40(%rbp), %rdi
00000000000c20c9	movq	%r14, %rsi
00000000000c20cc	addq	%rbx, 0x8(%r12)
00000000000c20d1	addq	(%r12), %rdi
00000000000c20d5	movq	%rbx, %rdx
00000000000c20d8	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c20dd	movq	-0x60(%rbp), %rax
00000000000c20e1	movl	0xc(%rax), %ebx
00000000000c20e4	movq	0x8(%r12), %r14
00000000000c20e9	movq	0x10(%r12), %rax
00000000000c20ee	leaq	0x14(%r14), %rsi
00000000000c20f2	testq	%rax, %rax
00000000000c20f5	movq	%r12, %r15
00000000000c20f8	je	0xc2f56
00000000000c20fe	cmpq	(%rax), %rsi
00000000000c2101	jb	0xc2f5e
00000000000c2107	movq	%r15, %r12
00000000000c210a	leaq	0x113(%r14), %r15
00000000000c2111	andq	$-0x100, %r15
00000000000c2118	movq	0x10(%rax), %rdi
00000000000c211c	movq	%r15, %rsi
00000000000c211f	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c2124	movq	0x10(%r12), %rcx
00000000000c2129	movq	%rax, 0x10(%rcx)
00000000000c212d	movq	%r15, (%rcx)
00000000000c2130	movq	%r12, %r15
00000000000c2133	movq	%rax, (%r12)
00000000000c2137	jmp	0xc2f5e
00000000000c213c	movq	-0x38(%rbp), %rax
00000000000c2140	movl	%eax, %edx
00000000000c2142	movl	-0x58(%rbp), %ecx
00000000000c2145	subl	%ecx, %edx
00000000000c2147	setb	%al
00000000000c214a	cmpl	$-0x1, %ecx
00000000000c214d	je	0xc2681
00000000000c2153	testb	%al, %al
00000000000c2155	leaq	__ZL5ctype(%rip), %rcx          ## ctype
00000000000c215c	jne	0xc2690
00000000000c2162	cmpl	$-0x1, %edx
00000000000c2165	je	0xc2690
00000000000c216b	movl	%edx, -0x40(%rbp)
00000000000c216e	movq	%r12, %rbx
00000000000c2171	subq	%rsi, %rbx
00000000000c2174	movq	0x8(%r15), %r13
00000000000c2178	movq	0x10(%r15), %rax
00000000000c217c	leaq	(%rbx,%r13), %rcx
00000000000c2180	testq	%rax, %rax
00000000000c2183	je	0xc234f
00000000000c2189	cmpq	(%rax), %rcx
00000000000c218c	jb	0xc235e
00000000000c2192	addq	$0xff, %rcx
00000000000c2199	andq	$-0x100, %rcx
00000000000c21a0	movq	%rcx, -0x78(%rbp)
00000000000c21a4	movq	0x10(%rax), %rdi
00000000000c21a8	movq	%rcx, %rsi
00000000000c21ab	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c21b0	movq	-0x30(%rbp), %rsi
00000000000c21b4	movq	0x10(%r15), %rcx
00000000000c21b8	movq	%rax, 0x10(%rcx)
00000000000c21bc	movq	-0x78(%rbp), %rdx
00000000000c21c0	movq	%rdx, (%rcx)
00000000000c21c3	movq	%rax, (%r15)
00000000000c21c6	jmp	0xc235e
00000000000c21cb	leaq	0x14(%r12), %r14
00000000000c21d0	xorl	%edx, %edx
00000000000c21d2	nopw	%cs:(%rax,%rax)
00000000000c21e0	leal	(%rdx,%rdx,4), %ecx
00000000000c21e3	movzbl	%al, %eax
00000000000c21e6	leal	(%rax,%rcx,2), %edx
00000000000c21e9	addl	$-0x30, %edx
00000000000c21ec	movzbl	0x1(%r14), %eax
00000000000c21f1	incq	%r14
00000000000c21f4	leal	-0x3a(%rax), %ecx
00000000000c21f7	cmpb	$-0xb, %cl
00000000000c21fa	ja	0xc21e0
00000000000c21fc	movq	%rdx, -0x38(%rbp)
00000000000c2200	movl	-0x68(%rbp), %eax
00000000000c2203	testl	%eax, %eax
00000000000c2205	je	0xc22c0
00000000000c220b	movq	-0x38(%rbp), %rcx
00000000000c220f	btl	%ecx, %eax
00000000000c2212	movl	%ecx, %edx
00000000000c2214	leaq	__ZL5ctype(%rip), %rcx          ## ctype
00000000000c221b	jb	0xc22e6
00000000000c2221	jmp	0xc2830
00000000000c2226	incl	%ecx
00000000000c2228	movl	%ecx, -0x54(%rbp)
00000000000c222b	incq	%r12
00000000000c222e	movq	%r12, %r13
00000000000c2231	movzbl	(%r12), %eax
00000000000c2236	testb	%al, %al
00000000000c2238	jne	0xc19e0
00000000000c223e	jmp	0xc322a
00000000000c2243	movq	-0x50(%rbp), %rdi
00000000000c2247	movq	%r15, %rsi
00000000000c224a	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c224f	movq	-0x50(%rbp), %rdx
00000000000c2253	movq	%r14, %rsi
00000000000c2256	addq	%rbx, 0x8(%rdx)
00000000000c225a	addq	(%rdx), %r13
00000000000c225d	movq	%rdx, %r15
00000000000c2260	movq	%r13, %rdi
00000000000c2263	movq	%rbx, %rdx
00000000000c2266	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c226b	cmpb	$0x0, -0x64(%rbp)
00000000000c226f	je	0xc24dd
00000000000c2275	movq	0x8(%r15), %r14
00000000000c2279	movq	0x10(%r15), %rax
00000000000c227d	leaq	0x9(%r14), %rsi
00000000000c2281	testq	%rax, %rax
00000000000c2284	je	0xc24b9
00000000000c228a	cmpq	(%rax), %rsi
00000000000c228d	jb	0xc24c1
00000000000c2293	leaq	0x108(%r14), %rbx
00000000000c229a	andq	$-0x100, %rbx
00000000000c22a1	movq	0x10(%rax), %rdi
00000000000c22a5	movq	%rbx, %rsi
00000000000c22a8	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c22ad	movq	0x10(%r15), %rcx
00000000000c22b1	movq	%rax, 0x10(%rcx)
00000000000c22b5	movq	%rbx, (%rcx)
00000000000c22b8	movq	%rax, (%r15)
00000000000c22bb	jmp	0xc24c1
00000000000c22c0	movq	-0x38(%rbp), %rax
00000000000c22c4	movl	%eax, %edx
00000000000c22c6	movl	-0x58(%rbp), %ecx
00000000000c22c9	subl	%ecx, %edx
00000000000c22cb	setb	%al
00000000000c22ce	cmpl	$-0x1, %ecx
00000000000c22d1	je	0xc281c
00000000000c22d7	testb	%al, %al
00000000000c22d9	leaq	__ZL5ctype(%rip), %rcx          ## ctype
00000000000c22e0	jne	0xc2830
00000000000c22e6	cmpl	$-0x1, %edx
00000000000c22e9	je	0xc2830
00000000000c22ef	movl	%edx, -0x40(%rbp)
00000000000c22f2	movq	%r12, %rbx
00000000000c22f5	subq	%rsi, %rbx
00000000000c22f8	movq	0x8(%r15), %r13
00000000000c22fc	movq	0x10(%r15), %rax
00000000000c2300	leaq	(%rbx,%r13), %rcx
00000000000c2304	testq	%rax, %rax
00000000000c2307	je	0xc26a4
00000000000c230d	cmpq	(%rax), %rcx
00000000000c2310	jb	0xc26b3
00000000000c2316	addq	$0xff, %rcx
00000000000c231d	andq	$-0x100, %rcx
00000000000c2324	movq	%rcx, -0x78(%rbp)
00000000000c2328	movq	0x10(%rax), %rdi
00000000000c232c	movq	%rcx, %rsi
00000000000c232f	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c2334	movq	-0x30(%rbp), %rsi
00000000000c2338	movq	0x10(%r15), %rcx
00000000000c233c	movq	%rax, 0x10(%rcx)
00000000000c2340	movq	-0x78(%rbp), %rdx
00000000000c2344	movq	%rdx, (%rcx)
00000000000c2347	movq	%rax, (%r15)
00000000000c234a	jmp	0xc26b3
00000000000c234f	movq	%r15, %rdi
00000000000c2352	movq	%rcx, %rsi
00000000000c2355	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c235a	movq	-0x30(%rbp), %rsi
00000000000c235e	addq	%rbx, 0x8(%r15)
00000000000c2362	addq	(%r15), %r13
00000000000c2365	movq	%r13, %rdi
00000000000c2368	movq	%rbx, %rdx
00000000000c236b	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c2370	movq	0x8(%r15), %r13
00000000000c2374	movq	0x10(%r15), %rax
00000000000c2378	leaq	0x4(%r13), %rsi
00000000000c237c	testq	%rax, %rax
00000000000c237f	je	0xc23b0
00000000000c2381	cmpq	(%rax), %rsi
00000000000c2384	jb	0xc23b8
00000000000c2386	leaq	0x103(%r13), %rbx
00000000000c238d	andq	$-0x100, %rbx
00000000000c2394	movq	0x10(%rax), %rdi
00000000000c2398	movq	%rbx, %rsi
00000000000c239b	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c23a0	movq	0x10(%r15), %rcx
00000000000c23a4	movq	%rax, 0x10(%rcx)
00000000000c23a8	movq	%rbx, (%rcx)
00000000000c23ab	movq	%rax, (%r15)
00000000000c23ae	jmp	0xc23b8
00000000000c23b0	movq	%r15, %rdi
00000000000c23b3	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c23b8	addq	$0x4, 0x8(%r15)
00000000000c23bd	movq	(%r15), %rax
00000000000c23c0	movl	$0x6e69616d, (%rax,%r13)        ## imm = 0x6E69616D
00000000000c23c8	movq	0x8(%r15), %rbx
00000000000c23cc	movq	0x10(%r15), %rax
00000000000c23d0	leaq	0x14(%rbx), %rsi
00000000000c23d4	testq	%rax, %rax
00000000000c23d7	je	0xc240f
00000000000c23d9	cmpq	(%rax), %rsi
00000000000c23dc	jb	0xc2417
00000000000c23de	movq	%r15, %r13
00000000000c23e1	leaq	0x113(%rbx), %r15
00000000000c23e8	andq	$-0x100, %r15
00000000000c23ef	movq	0x10(%rax), %rdi
00000000000c23f3	movq	%r15, %rsi
00000000000c23f6	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c23fb	movq	0x10(%r13), %rcx
00000000000c23ff	movq	%rax, 0x10(%rcx)
00000000000c2403	movq	%r15, (%rcx)
00000000000c2406	movq	%r13, %r15
00000000000c2409	movq	%rax, (%r13)
00000000000c240d	jmp	0xc2417
00000000000c240f	movq	%r15, %rdi
00000000000c2412	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2417	addq	(%r15), %rbx
00000000000c241a	movq	%rbx, %rdi
00000000000c241d	movl	-0x40(%rbp), %esi
00000000000c2420	callq	__ZL4itoaPci                    ## itoa(char*, int)
00000000000c2425	movq	0x8(%r15), %rdx
00000000000c2429	movq	0x10(%r15), %rcx
00000000000c242d	leaq	(%rdx,%rax), %r13
00000000000c2431	movq	%r13, 0x8(%r15)
00000000000c2435	leaq	(%rdx,%rax), %rsi
00000000000c2439	incq	%rsi
00000000000c243c	testq	%rcx, %rcx
00000000000c243f	je	0xc2473
00000000000c2441	cmpq	(%rcx), %rsi
00000000000c2444	jb	0xc247b
00000000000c2446	movq	%r13, %rbx
00000000000c2449	andq	$-0x100, %rbx
00000000000c2450	addq	$0x100, %rbx                    ## imm = 0x100
00000000000c2457	movq	0x10(%rcx), %rdi
00000000000c245b	movq	%rbx, %rsi
00000000000c245e	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c2463	movq	0x10(%r15), %rcx
00000000000c2467	movq	%rax, 0x10(%rcx)
00000000000c246b	movq	%rbx, (%rcx)
00000000000c246e	movq	%rax, (%r15)
00000000000c2471	jmp	0xc247b
00000000000c2473	movq	%r15, %rdi
00000000000c2476	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c247b	incq	0x8(%r15)
00000000000c247f	movq	(%r15), %rax
00000000000c2482	movb	$0x28, (%rax,%r13)
00000000000c2487	testq	%r14, %r14
00000000000c248a	cmovneq	%r14, %r12
00000000000c248e	movq	%r12, %r13
00000000000c2491	movzbl	(%r13), %eax
00000000000c2496	testl	%eax, %eax
00000000000c2498	je	0xc24b1
00000000000c249a	nopw	(%rax,%rax)
00000000000c24a0	cmpl	$0x29, %eax
00000000000c24a3	je	0xc24b1
00000000000c24a5	incq	%r13
00000000000c24a8	movzbl	(%r13), %eax
00000000000c24ad	testl	%eax, %eax
00000000000c24af	jne	0xc24a0
00000000000c24b1	movq	%r13, %rsi
00000000000c24b4	jmp	0xc2236
00000000000c24b9	movq	%r15, %rdi
00000000000c24bc	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c24c1	addq	$0x9, 0x8(%r15)
00000000000c24c6	movq	(%r15), %rax
00000000000c24c9	movabsq	$0x70746c7561666564, %rcx       ## imm = 0x70746C7561666564
00000000000c24d3	movq	%rcx, (%rax,%r14)
00000000000c24d7	movb	$0x20, 0x8(%rax,%r14)
00000000000c24dd	movq	0x8(%r15), %r14
00000000000c24e1	movq	0x10(%r15), %rax
00000000000c24e5	leaq	0x9(%r14), %rsi
00000000000c24e9	testq	%rax, %rax
00000000000c24ec	je	0xc251d
00000000000c24ee	cmpq	(%rax), %rsi
00000000000c24f1	jb	0xc2525
00000000000c24f3	leaq	0x108(%r14), %rbx
00000000000c24fa	andq	$-0x100, %rbx
00000000000c2501	movq	0x10(%rax), %rdi
00000000000c2505	movq	%rbx, %rsi
00000000000c2508	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c250d	movq	0x10(%r15), %rcx
00000000000c2511	movq	%rax, 0x10(%rcx)
00000000000c2515	movq	%rbx, (%rcx)
00000000000c2518	movq	%rax, (%r15)
00000000000c251b	jmp	0xc2525
00000000000c251d	movq	%r15, %rdi
00000000000c2520	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2525	addq	$0x9, 0x8(%r15)
00000000000c252a	movq	(%r15), %rax
00000000000c252d	movabsq	$0x69616d2034636576, %rcx       ## imm = 0x69616D2034636576
00000000000c2537	movq	%rcx, (%rax,%r14)
00000000000c253b	movb	$0x6e, 0x8(%rax,%r14)
00000000000c2541	movq	-0x60(%rbp), %rax
00000000000c2545	movl	0xc(%rax), %ebx
00000000000c2548	movq	0x8(%r15), %r14
00000000000c254c	movq	0x10(%r15), %rax
00000000000c2550	leaq	0x14(%r14), %rsi
00000000000c2554	testq	%rax, %rax
00000000000c2557	je	0xc258f
00000000000c2559	cmpq	(%rax), %rsi
00000000000c255c	jb	0xc2597
00000000000c255e	movq	%r15, %r13
00000000000c2561	leaq	0x113(%r14), %r15
00000000000c2568	andq	$-0x100, %r15
00000000000c256f	movq	0x10(%rax), %rdi
00000000000c2573	movq	%r15, %rsi
00000000000c2576	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c257b	movq	0x10(%r13), %rcx
00000000000c257f	movq	%rax, 0x10(%rcx)
00000000000c2583	movq	%r15, (%rcx)
00000000000c2586	movq	%r13, %r15
00000000000c2589	movq	%rax, (%r13)
00000000000c258d	jmp	0xc2597
00000000000c258f	movq	%r15, %rdi
00000000000c2592	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2597	addq	(%r15), %r14
00000000000c259a	movq	%r14, %rdi
00000000000c259d	movl	%ebx, %esi
00000000000c259f	callq	__ZL4itoaPci                    ## itoa(char*, int)
00000000000c25a4	addq	%rax, 0x8(%r15)
00000000000c25a8	addq	$0x9, %r12
00000000000c25ac	movl	$0x1, %eax
00000000000c25b1	movq	%rax, -0x70(%rbp)
00000000000c25b5	movq	%r12, %r13
00000000000c25b8	movq	%r12, %rsi
00000000000c25bb	jmp	0xc2231
00000000000c25c0	movq	%r12, %rdi
00000000000c25c3	movq	%rsi, %rax
00000000000c25c6	movq	%r15, %rsi
00000000000c25c9	movq	%rax, %r15
00000000000c25cc	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c25d1	movq	%r15, %rsi
00000000000c25d4	addq	%rbx, 0x8(%r12)
00000000000c25d9	addq	(%r12), %r14
00000000000c25dd	movq	%r14, %rdi
00000000000c25e0	movq	%rbx, %rdx
00000000000c25e3	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c25e8	movq	0x8(%r12), %r14
00000000000c25ed	movq	0x10(%r12), %rax
00000000000c25f2	cmpb	$0x0, -0x64(%rbp)
00000000000c25f6	movq	%r12, %r15
00000000000c25f9	je	0xc263e
00000000000c25fb	leaq	0x20(%r14), %rsi
00000000000c25ff	testq	%rax, %rax
00000000000c2602	je	0xc2844
00000000000c2608	cmpq	(%rax), %rsi
00000000000c260b	jb	0xc284c
00000000000c2611	leaq	0x11f(%r14), %rbx
00000000000c2618	andq	$-0x100, %rbx
00000000000c261f	movq	0x10(%rax), %rdi
00000000000c2623	movq	%rbx, %rsi
00000000000c2626	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c262b	movq	0x10(%r15), %rcx
00000000000c262f	movq	%rax, 0x10(%rcx)
00000000000c2633	movq	%rbx, (%rcx)
00000000000c2636	movq	%rax, (%r15)
00000000000c2639	jmp	0xc284c
00000000000c263e	leaq	0x17(%r14), %rsi
00000000000c2642	testq	%rax, %rax
00000000000c2645	je	0xc286f
00000000000c264b	cmpq	(%rax), %rsi
00000000000c264e	jb	0xc2877
00000000000c2654	leaq	0x116(%r14), %rbx
00000000000c265b	andq	$-0x100, %rbx
00000000000c2662	movq	0x10(%rax), %rdi
00000000000c2666	movq	%rbx, %rsi
00000000000c2669	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c266e	movq	0x10(%r15), %rcx
00000000000c2672	movq	%rax, 0x10(%rcx)
00000000000c2676	movq	%rbx, (%rcx)
00000000000c2679	movq	%rax, (%r15)
00000000000c267c	jmp	0xc2877
00000000000c2681	leaq	__ZL5ctype(%rip), %rcx          ## ctype
00000000000c2688	nopl	(%rax,%rax)
00000000000c2690	movzbl	0x1(%r12), %eax
00000000000c2696	incq	%r12
00000000000c2699	testb	$0x40, (%rcx,%rax,2)
00000000000c269d	jne	0xc2690
00000000000c269f	jmp	0xc222e
00000000000c26a4	movq	%r15, %rdi
00000000000c26a7	movq	%rcx, %rsi
00000000000c26aa	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c26af	movq	-0x30(%rbp), %rsi
00000000000c26b3	addq	%rbx, 0x8(%r15)
00000000000c26b7	addq	(%r15), %r13
00000000000c26ba	movq	%r13, %rdi
00000000000c26bd	movq	%rbx, %rdx
00000000000c26c0	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c26c5	movq	0x8(%r15), %r13
00000000000c26c9	movq	0x10(%r15), %rax
00000000000c26cd	leaq	0x4(%r13), %rsi
00000000000c26d1	testq	%rax, %rax
00000000000c26d4	je	0xc2705
00000000000c26d6	cmpq	(%rax), %rsi
00000000000c26d9	jb	0xc270d
00000000000c26db	leaq	0x103(%r13), %rbx
00000000000c26e2	andq	$-0x100, %rbx
00000000000c26e9	movq	0x10(%rax), %rdi
00000000000c26ed	movq	%rbx, %rsi
00000000000c26f0	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c26f5	movq	0x10(%r15), %rcx
00000000000c26f9	movq	%rax, 0x10(%rcx)
00000000000c26fd	movq	%rbx, (%rcx)
00000000000c2700	movq	%rax, (%r15)
00000000000c2703	jmp	0xc270d
00000000000c2705	movq	%r15, %rdi
00000000000c2708	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c270d	addq	$0x4, 0x8(%r15)
00000000000c2712	movq	(%r15), %rax
00000000000c2715	movl	$0x6e69616d, (%rax,%r13)        ## imm = 0x6E69616D
00000000000c271d	movq	0x8(%r15), %rbx
00000000000c2721	movq	0x10(%r15), %rax
00000000000c2725	leaq	0x14(%rbx), %rsi
00000000000c2729	testq	%rax, %rax
00000000000c272c	movq	%r15, %r13
00000000000c272f	je	0xc2761
00000000000c2731	cmpq	(%rax), %rsi
00000000000c2734	jb	0xc2769
00000000000c2736	leaq	0x113(%rbx), %r15
00000000000c273d	andq	$-0x100, %r15
00000000000c2744	movq	0x10(%rax), %rdi
00000000000c2748	movq	%r15, %rsi
00000000000c274b	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c2750	movq	0x10(%r13), %rcx
00000000000c2754	movq	%rax, 0x10(%rcx)
00000000000c2758	movq	%r15, (%rcx)
00000000000c275b	movq	%rax, (%r13)
00000000000c275f	jmp	0xc2769
00000000000c2761	movq	%r13, %rdi
00000000000c2764	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2769	addq	(%r13), %rbx
00000000000c276d	movq	%rbx, %rdi
00000000000c2770	movl	-0x40(%rbp), %esi
00000000000c2773	callq	__ZL4itoaPci                    ## itoa(char*, int)
00000000000c2778	movq	0x8(%r13), %rdx
00000000000c277c	movq	0x10(%r13), %rcx
00000000000c2780	leaq	(%rdx,%rax), %r15
00000000000c2784	movq	%r15, 0x8(%r13)
00000000000c2788	leaq	(%rdx,%rax), %rsi
00000000000c278c	incq	%rsi
00000000000c278f	testq	%rcx, %rcx
00000000000c2792	je	0xc27c7
00000000000c2794	cmpq	(%rcx), %rsi
00000000000c2797	jb	0xc27cf
00000000000c2799	movq	%r15, %rbx
00000000000c279c	andq	$-0x100, %rbx
00000000000c27a3	addq	$0x100, %rbx                    ## imm = 0x100
00000000000c27aa	movq	0x10(%rcx), %rdi
00000000000c27ae	movq	%rbx, %rsi
00000000000c27b1	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c27b6	movq	0x10(%r13), %rcx
00000000000c27ba	movq	%rax, 0x10(%rcx)
00000000000c27be	movq	%rbx, (%rcx)
00000000000c27c1	movq	%rax, (%r13)
00000000000c27c5	jmp	0xc27cf
00000000000c27c7	movq	%r13, %rdi
00000000000c27ca	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c27cf	incq	0x8(%r13)
00000000000c27d3	movq	%r13, %rcx
00000000000c27d6	movq	(%r13), %rax
00000000000c27da	movb	$0x28, (%rax,%r15)
00000000000c27df	testq	%r14, %r14
00000000000c27e2	cmovneq	%r14, %r12
00000000000c27e6	movq	%r12, %r13
00000000000c27e9	movzbl	(%r13), %eax
00000000000c27ee	testl	%eax, %eax
00000000000c27f0	je	0xc2811
00000000000c27f2	nopw	%cs:(%rax,%rax)
00000000000c2800	cmpl	$0x29, %eax
00000000000c2803	je	0xc2811
00000000000c2805	incq	%r13
00000000000c2808	movzbl	(%r13), %eax
00000000000c280d	testl	%eax, %eax
00000000000c280f	jne	0xc2800
00000000000c2811	movq	%r13, %rsi
00000000000c2814	movq	%rcx, %r15
00000000000c2817	jmp	0xc2236
00000000000c281c	leaq	__ZL5ctype(%rip), %rcx          ## ctype
00000000000c2823	nopw	%cs:(%rax,%rax)
00000000000c2830	movzbl	0x1(%r12), %eax
00000000000c2836	incq	%r12
00000000000c2839	testb	$0x40, (%rcx,%rax,2)
00000000000c283d	jne	0xc2830
00000000000c283f	jmp	0xc222e
00000000000c2844	movq	%r15, %rdi
00000000000c2847	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c284c	addq	$0x20, 0x8(%r15)
00000000000c2851	movq	(%r15), %rax
00000000000c2854	movups	0x8228fb(%rip), %xmm0           ## literal pool for: "c4 hg_FragColor;"
00000000000c285b	movups	%xmm0, 0x10(%rax,%r14)
00000000000c2861	movups	0x8228de(%rip), %xmm0           ## literal pool for: "\n    defaultp vec4 hg_FragColor;"
00000000000c2868	movups	%xmm0, (%rax,%r14)
00000000000c286d	jmp	0xc289a
00000000000c286f	movq	%r15, %rdi
00000000000c2872	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2877	addq	$0x17, 0x8(%r15)
00000000000c287c	movq	(%r15), %rax
00000000000c287f	movups	0x8228e1(%rip), %xmm0           ## literal pool for: "\n    vec4 hg_FragColor;"
00000000000c2886	movups	%xmm0, (%rax,%r14)
00000000000c288b	movabsq	$0x3b726f6c6f436761, %rcx       ## imm = 0x3B726F6C6F436761
00000000000c2895	movq	%rcx, 0xf(%rax,%r14)
00000000000c289a	movl	$0x1, -0x54(%rbp)
00000000000c28a1	movq	%r13, %rsi
00000000000c28a4	movl	$0x1, %eax
00000000000c28a9	movq	%rax, -0x70(%rbp)
00000000000c28ad	movzbl	(%r13), %eax
00000000000c28b2	jmp	0xc2236
00000000000c28b7	movq	%r12, %r13
00000000000c28ba	addq	$0xb, %r13
00000000000c28be	movq	%r13, %rbx
00000000000c28c1	movq	-0x30(%rbp), %rsi
00000000000c28c5	subq	%rsi, %rbx
00000000000c28c8	movq	0x8(%r15), %r14
00000000000c28cc	movq	0x10(%r15), %rax
00000000000c28d0	movq	%r15, %r12
00000000000c28d3	leaq	(%r14,%rbx), %r15
00000000000c28d7	testq	%rax, %rax
00000000000c28da	je	0xc2a7a
00000000000c28e0	cmpq	(%rax), %r15
00000000000c28e3	jb	0xc2a89
00000000000c28e9	addq	$0xff, %r15
00000000000c28f0	andq	$-0x100, %r15
00000000000c28f7	movq	0x10(%rax), %rdi
00000000000c28fb	movq	%r15, %rsi
00000000000c28fe	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c2903	movq	-0x30(%rbp), %rsi
00000000000c2907	movq	0x10(%r12), %rcx
00000000000c290c	movq	%rax, 0x10(%rcx)
00000000000c2910	movq	%r15, (%rcx)
00000000000c2913	movq	%rax, (%r12)
00000000000c2917	jmp	0xc2a89
00000000000c291c	leaq	0xa(%r12), %r13
00000000000c2921	cmpb	$0x0, -0x44(%rbp)
00000000000c2925	je	0xc29f6
00000000000c292b	movq	%r13, %rbx
00000000000c292e	movq	-0x30(%rbp), %rsi
00000000000c2932	subq	%rsi, %rbx
00000000000c2935	movq	0x8(%r15), %r14
00000000000c2939	movq	0x10(%r15), %rax
00000000000c293d	movq	%r15, %r12
00000000000c2940	leaq	(%r14,%rbx), %r15
00000000000c2944	testq	%rax, %rax
00000000000c2947	je	0xc2bce
00000000000c294d	cmpq	(%rax), %r15
00000000000c2950	jb	0xc2bdd
00000000000c2956	addq	$0xff, %r15
00000000000c295d	andq	$-0x100, %r15
00000000000c2964	movq	0x10(%rax), %rdi
00000000000c2968	movq	%r15, %rsi
00000000000c296b	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c2970	movq	-0x30(%rbp), %rsi
00000000000c2974	movq	0x10(%r12), %rcx
00000000000c2979	movq	%rax, 0x10(%rcx)
00000000000c297d	movq	%r15, (%rcx)
00000000000c2980	movq	%rax, (%r12)
00000000000c2984	jmp	0xc2bdd
00000000000c2989	leaq	0xb(%r12), %r13
00000000000c298e	cmpb	$0x0, -0x44(%rbp)
00000000000c2992	je	0xc2b46
00000000000c2998	movq	%r13, %rbx
00000000000c299b	movq	-0x30(%rbp), %rsi
00000000000c299f	subq	%rsi, %rbx
00000000000c29a2	movq	0x8(%r15), %r14
00000000000c29a6	movq	0x10(%r15), %rax
00000000000c29aa	movq	%r15, %r12
00000000000c29ad	leaq	(%r14,%rbx), %r15
00000000000c29b1	testq	%rax, %rax
00000000000c29b4	je	0xc2ed5
00000000000c29ba	cmpq	(%rax), %r15
00000000000c29bd	jb	0xc2ee4
00000000000c29c3	addq	$0xff, %r15
00000000000c29ca	andq	$-0x100, %r15
00000000000c29d1	movq	0x10(%rax), %rdi
00000000000c29d5	movq	%r15, %rsi
00000000000c29d8	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c29dd	movq	-0x30(%rbp), %rsi
00000000000c29e1	movq	0x10(%r12), %rcx
00000000000c29e6	movq	%rax, 0x10(%rcx)
00000000000c29ea	movq	%r15, (%rcx)
00000000000c29ed	movq	%rax, (%r12)
00000000000c29f1	jmp	0xc2ee4
00000000000c29f6	movzbl	(%r13), %eax
00000000000c29fb	leal	-0x3a(%rax), %ecx
00000000000c29fe	cmpb	$-0xa, %cl
00000000000c2a01	movq	-0x30(%rbp), %rsi
00000000000c2a05	jae	0xc2b65
00000000000c2a0b	xorl	%edx, %edx
00000000000c2a0d	xorl	%r15d, %r15d
00000000000c2a10	jmp	0xc2b86
00000000000c2a15	movq	%r12, %r13
00000000000c2a18	addq	$0xf, %r13
00000000000c2a1c	movq	%r13, %rbx
00000000000c2a1f	movq	-0x30(%rbp), %rsi
00000000000c2a23	subq	%rsi, %rbx
00000000000c2a26	movq	0x8(%r15), %r14
00000000000c2a2a	movq	0x10(%r15), %rax
00000000000c2a2e	movq	%r15, %r12
00000000000c2a31	leaq	(%r14,%rbx), %r15
00000000000c2a35	testq	%rax, %rax
00000000000c2a38	je	0xc2da2
00000000000c2a3e	cmpq	(%rax), %r15
00000000000c2a41	jb	0xc2db1
00000000000c2a47	addq	$0xff, %r15
00000000000c2a4e	andq	$-0x100, %r15
00000000000c2a55	movq	0x10(%rax), %rdi
00000000000c2a59	movq	%r15, %rsi
00000000000c2a5c	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c2a61	movq	-0x30(%rbp), %rsi
00000000000c2a65	movq	0x10(%r12), %rcx
00000000000c2a6a	movq	%rax, 0x10(%rcx)
00000000000c2a6e	movq	%r15, (%rcx)
00000000000c2a71	movq	%rax, (%r12)
00000000000c2a75	jmp	0xc2db1
00000000000c2a7a	movq	%r12, %rdi
00000000000c2a7d	movq	%r15, %rsi
00000000000c2a80	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2a85	movq	-0x30(%rbp), %rsi
00000000000c2a89	addq	%rbx, 0x8(%r12)
00000000000c2a8e	addq	(%r12), %r14
00000000000c2a92	movq	%r14, %rdi
00000000000c2a95	movq	%rbx, %rdx
00000000000c2a98	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c2a9d	movzbl	(%r13), %ecx
00000000000c2aa2	leal	-0x3a(%rcx), %eax
00000000000c2aa5	cmpb	$-0xa, %al
00000000000c2aa7	movq	%r12, %r15
00000000000c2aaa	jae	0xc2ab2
00000000000c2aac	xorl	%esi, %esi
00000000000c2aae	xorl	%eax, %eax
00000000000c2ab0	jmp	0xc2ad2
00000000000c2ab2	xorl	%esi, %esi
00000000000c2ab4	movq	%r13, %rax
00000000000c2ab7	leal	(%rsi,%rsi,4), %edx
00000000000c2aba	movzbl	%cl, %ecx
00000000000c2abd	leal	(%rcx,%rdx,2), %esi
00000000000c2ac0	addl	$-0x30, %esi
00000000000c2ac3	movzbl	0x1(%rax), %ecx
00000000000c2ac7	incq	%rax
00000000000c2aca	leal	-0x3a(%rcx), %edx
00000000000c2acd	cmpb	$-0xb, %dl
00000000000c2ad0	ja	0xc2ab7
00000000000c2ad2	testq	%rax, %rax
00000000000c2ad5	cmovneq	%rax, %r13
00000000000c2ad9	movq	-0x60(%rbp), %rax
00000000000c2add	movl	0x8(%rax), %ebx
00000000000c2ae0	movq	%rsi, -0x38(%rbp)
00000000000c2ae4	jmp	0xc2f3f
00000000000c2ae9	movq	%r12, %rbx
00000000000c2aec	movq	-0x30(%rbp), %rsi
00000000000c2af0	subq	%rsi, %rbx
00000000000c2af3	movq	0x8(%r15), %r14
00000000000c2af7	movq	0x10(%r15), %rax
00000000000c2afb	movq	%r15, %r13
00000000000c2afe	leaq	(%r14,%rbx), %r15
00000000000c2b02	testq	%rax, %rax
00000000000c2b05	je	0xc2e40
00000000000c2b0b	cmpq	(%rax), %r15
00000000000c2b0e	jb	0xc2e4f
00000000000c2b14	addq	$0xff, %r15
00000000000c2b1b	andq	$-0x100, %r15
00000000000c2b22	movq	0x10(%rax), %rdi
00000000000c2b26	movq	%r15, %rsi
00000000000c2b29	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c2b2e	movq	-0x30(%rbp), %rsi
00000000000c2b32	movq	0x10(%r13), %rcx
00000000000c2b36	movq	%rax, 0x10(%rcx)
00000000000c2b3a	movq	%r15, (%rcx)
00000000000c2b3d	movq	%rax, (%r13)
00000000000c2b41	jmp	0xc2e4f
00000000000c2b46	movzbl	(%r13), %eax
00000000000c2b4b	leal	-0x3a(%rax), %ecx
00000000000c2b4e	cmpb	$-0xa, %cl
00000000000c2b51	movq	-0x30(%rbp), %rsi
00000000000c2b55	jae	0xc2d5e
00000000000c2b5b	xorl	%edx, %edx
00000000000c2b5d	xorl	%r15d, %r15d
00000000000c2b60	jmp	0xc2d7f
00000000000c2b65	xorl	%edx, %edx
00000000000c2b67	movq	%r13, %r15
00000000000c2b6a	leal	(%rdx,%rdx,4), %ecx
00000000000c2b6d	movzbl	%al, %eax
00000000000c2b70	leal	(%rax,%rcx,2), %edx
00000000000c2b73	addl	$-0x30, %edx
00000000000c2b76	movzbl	0x1(%r15), %eax
00000000000c2b7b	incq	%r15
00000000000c2b7e	leal	-0x3a(%rax), %ecx
00000000000c2b81	cmpb	$-0xb, %cl
00000000000c2b84	ja	0xc2b6a
00000000000c2b86	movq	%rdx, -0x38(%rbp)
00000000000c2b8a	movl	-0x68(%rbp), %eax
00000000000c2b8d	testl	%eax, %eax
00000000000c2b8f	je	0xc2c3d
00000000000c2b95	movq	-0x38(%rbp), %rcx
00000000000c2b99	btl	%ecx, %eax
00000000000c2b9c	movl	%ecx, %eax
00000000000c2b9e	jb	0xc2c54
00000000000c2ba4	jmp	0xc2cf9
00000000000c2ba9	movq	%r12, %rdi
00000000000c2bac	movq	%rsi, %rax
00000000000c2baf	movq	%r15, %rsi
00000000000c2bb2	movq	%rax, %r15
00000000000c2bb5	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2bba	movq	%r15, %rsi
00000000000c2bbd	addq	%rbx, 0x8(%r12)
00000000000c2bc2	addq	(%r12), %r14
00000000000c2bc6	movq	%r14, %rdi
00000000000c2bc9	jmp	0xc20d5
00000000000c2bce	movq	%r12, %rdi
00000000000c2bd1	movq	%r15, %rsi
00000000000c2bd4	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2bd9	movq	-0x30(%rbp), %rsi
00000000000c2bdd	addq	%rbx, 0x8(%r12)
00000000000c2be2	addq	(%r12), %r14
00000000000c2be6	movq	%r14, %rdi
00000000000c2be9	movq	%rbx, %rdx
00000000000c2bec	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c2bf1	movzbl	(%r13), %ecx
00000000000c2bf6	leal	-0x3a(%rcx), %eax
00000000000c2bf9	cmpb	$-0xa, %al
00000000000c2bfb	movq	%r12, %r15
00000000000c2bfe	jae	0xc2c06
00000000000c2c00	xorl	%esi, %esi
00000000000c2c02	xorl	%eax, %eax
00000000000c2c04	jmp	0xc2c26
00000000000c2c06	xorl	%esi, %esi
00000000000c2c08	movq	%r13, %rax
00000000000c2c0b	leal	(%rsi,%rsi,4), %edx
00000000000c2c0e	movzbl	%cl, %ecx
00000000000c2c11	leal	(%rcx,%rdx,2), %esi
00000000000c2c14	addl	$-0x30, %esi
00000000000c2c17	movzbl	0x1(%rax), %ecx
00000000000c2c1b	incq	%rax
00000000000c2c1e	leal	-0x3a(%rcx), %edx
00000000000c2c21	cmpb	$-0xb, %dl
00000000000c2c24	ja	0xc2c0b
00000000000c2c26	movq	%rsi, -0x38(%rbp)
00000000000c2c2a	testq	%rax, %rax
00000000000c2c2d	cmovneq	%rax, %r13
00000000000c2c31	movq	-0x60(%rbp), %rax
00000000000c2c35	movl	0x18(%rax), %ebx
00000000000c2c38	jmp	0xc2f3f
00000000000c2c3d	cmpl	$-0x1, -0x58(%rbp)
00000000000c2c41	je	0xc2cf9
00000000000c2c47	movq	-0x38(%rbp), %rax
00000000000c2c4b	subl	-0x58(%rbp), %eax
00000000000c2c4e	jb	0xc2cf9
00000000000c2c54	cmpl	$-0x1, %eax
00000000000c2c57	je	0xc2cf9
00000000000c2c5d	testq	%r15, %r15
00000000000c2c60	cmovneq	%r15, %r12
00000000000c2c64	movq	%r12, %rbx
00000000000c2c67	subq	%rsi, %rbx
00000000000c2c6a	movq	%r12, %r14
00000000000c2c6d	movq	-0x50(%rbp), %r15
00000000000c2c71	leaq	0x8224a7(%rip), %r13            ## literal pool for: "uniform"
00000000000c2c78	jmp	0xc2c80
00000000000c2c7a	decq	%r14
00000000000c2c7d	decq	%rbx
00000000000c2c80	cmpb	$0x75, (%r14)
00000000000c2c84	jne	0xc2c7a
00000000000c2c86	movl	$0x7, %edx
00000000000c2c8b	movq	%r14, %rdi
00000000000c2c8e	movq	%r13, %rsi
00000000000c2c91	callq	0x3c5618                        ## symbol stub for: _strncmp
00000000000c2c96	movq	-0x30(%rbp), %rdx
00000000000c2c9a	testl	%eax, %eax
00000000000c2c9c	jne	0xc2c7a
00000000000c2c9e	movq	0x8(%r15), %r14
00000000000c2ca2	movq	0x10(%r15), %rax
00000000000c2ca6	leaq	(%r14,%rbx), %rsi
00000000000c2caa	testq	%rax, %rax
00000000000c2cad	je	0xc313a
00000000000c2cb3	cmpq	(%rax), %rsi
00000000000c2cb6	jb	0xc3146
00000000000c2cbc	leaq	(%r14,%rbx), %r15
00000000000c2cc0	addq	$0xff, %r15
00000000000c2cc7	andq	$-0x100, %r15
00000000000c2cce	movq	0x10(%rax), %rdi
00000000000c2cd2	movq	%r15, %rsi
00000000000c2cd5	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c2cda	movq	-0x30(%rbp), %rdx
00000000000c2cde	movq	-0x50(%rbp), %rcx
00000000000c2ce2	movq	0x10(%rcx), %rcx
00000000000c2ce6	movq	%rax, 0x10(%rcx)
00000000000c2cea	movq	%r15, (%rcx)
00000000000c2ced	movq	-0x50(%rbp), %r15
00000000000c2cf1	movq	%rax, (%r15)
00000000000c2cf4	jmp	0xc3146
00000000000c2cf9	movq	%r13, %rbx
00000000000c2cfc	subq	%rsi, %rbx
00000000000c2cff	movq	-0x50(%rbp), %r12
00000000000c2d03	movq	0x8(%r12), %r14
00000000000c2d08	movq	0x10(%r12), %rax
00000000000c2d0d	leaq	(%r14,%rbx), %rcx
00000000000c2d11	testq	%rax, %rax
00000000000c2d14	je	0xc2e11
00000000000c2d1a	cmpq	(%rax), %rcx
00000000000c2d1d	jb	0xc2e20
00000000000c2d23	addq	$0xff, %rcx
00000000000c2d2a	andq	$-0x100, %rcx
00000000000c2d31	movq	%rcx, -0x40(%rbp)
00000000000c2d35	movq	0x10(%rax), %rdi
00000000000c2d39	movq	%rcx, %rsi
00000000000c2d3c	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c2d41	movq	-0x30(%rbp), %rsi
00000000000c2d45	movq	0x10(%r12), %rcx
00000000000c2d4a	movq	%rax, 0x10(%rcx)
00000000000c2d4e	movq	-0x40(%rbp), %rdx
00000000000c2d52	movq	%rdx, (%rcx)
00000000000c2d55	movq	%rax, (%r12)
00000000000c2d59	jmp	0xc2e20
00000000000c2d5e	xorl	%edx, %edx
00000000000c2d60	movq	%r13, %r15
00000000000c2d63	leal	(%rdx,%rdx,4), %ecx
00000000000c2d66	movzbl	%al, %eax
00000000000c2d69	leal	(%rax,%rcx,2), %edx
00000000000c2d6c	addl	$-0x30, %edx
00000000000c2d6f	movzbl	0x1(%r15), %eax
00000000000c2d74	incq	%r15
00000000000c2d77	leal	-0x3a(%rax), %ecx
00000000000c2d7a	cmpb	$-0xb, %cl
00000000000c2d7d	ja	0xc2d63
00000000000c2d7f	movq	%rdx, -0x38(%rbp)
00000000000c2d83	movl	-0x68(%rbp), %eax
00000000000c2d86	testl	%eax, %eax
00000000000c2d88	je	0xc2f7c
00000000000c2d8e	movq	-0x38(%rbp), %rcx
00000000000c2d92	btl	%ecx, %eax
00000000000c2d95	movl	%ecx, %eax
00000000000c2d97	jb	0xc2f93
00000000000c2d9d	jmp	0xc3038
00000000000c2da2	movq	%r12, %rdi
00000000000c2da5	movq	%r15, %rsi
00000000000c2da8	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2dad	movq	-0x30(%rbp), %rsi
00000000000c2db1	addq	%rbx, 0x8(%r12)
00000000000c2db6	addq	(%r12), %r14
00000000000c2dba	movq	%r14, %rdi
00000000000c2dbd	movq	%rbx, %rdx
00000000000c2dc0	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c2dc5	movzbl	(%r13), %ecx
00000000000c2dca	leal	-0x3a(%rcx), %eax
00000000000c2dcd	cmpb	$-0xa, %al
00000000000c2dcf	movq	%r12, %r15
00000000000c2dd2	jae	0xc2dda
00000000000c2dd4	xorl	%esi, %esi
00000000000c2dd6	xorl	%eax, %eax
00000000000c2dd8	jmp	0xc2dfa
00000000000c2dda	xorl	%esi, %esi
00000000000c2ddc	movq	%r13, %rax
00000000000c2ddf	leal	(%rsi,%rsi,4), %edx
00000000000c2de2	movzbl	%cl, %ecx
00000000000c2de5	leal	(%rcx,%rdx,2), %esi
00000000000c2de8	addl	$-0x30, %esi
00000000000c2deb	movzbl	0x1(%rax), %ecx
00000000000c2def	incq	%rax
00000000000c2df2	leal	-0x3a(%rcx), %edx
00000000000c2df5	cmpb	$-0xb, %dl
00000000000c2df8	ja	0xc2ddf
00000000000c2dfa	movq	%rsi, -0x38(%rbp)
00000000000c2dfe	testq	%rax, %rax
00000000000c2e01	cmovneq	%rax, %r13
00000000000c2e05	movq	-0x60(%rbp), %rax
00000000000c2e09	movl	0x10(%rax), %ebx
00000000000c2e0c	jmp	0xc2f3f
00000000000c2e11	movq	%r12, %rdi
00000000000c2e14	movq	%rcx, %rsi
00000000000c2e17	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2e1c	movq	-0x30(%rbp), %rsi
00000000000c2e20	addq	%rbx, 0x8(%r12)
00000000000c2e25	addq	(%r12), %r14
00000000000c2e29	movq	%r14, %rdi
00000000000c2e2c	movq	%rbx, %rdx
00000000000c2e2f	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c2e34	movq	-0x60(%rbp), %rax
00000000000c2e38	movl	0x18(%rax), %ebx
00000000000c2e3b	jmp	0xc30bc
00000000000c2e40	movq	%r13, %rdi
00000000000c2e43	movq	%r15, %rsi
00000000000c2e46	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2e4b	movq	-0x30(%rbp), %rsi
00000000000c2e4f	addq	%rbx, 0x8(%r13)
00000000000c2e53	addq	(%r13), %r14
00000000000c2e57	movq	%r14, %rdi
00000000000c2e5a	movq	%rbx, %rdx
00000000000c2e5d	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c2e62	movq	0x8(%r13), %r14
00000000000c2e66	movq	0x10(%r13), %rax
00000000000c2e6a	leaq	0xc(%r14), %rsi
00000000000c2e6e	testq	%rax, %rax
00000000000c2e71	movq	%r13, %r15
00000000000c2e74	je	0xc2ea5
00000000000c2e76	cmpq	(%rax), %rsi
00000000000c2e79	jb	0xc2ead
00000000000c2e7b	leaq	0x10b(%r14), %rbx
00000000000c2e82	andq	$-0x100, %rbx
00000000000c2e89	movq	0x10(%rax), %rdi
00000000000c2e8d	movq	%rbx, %rsi
00000000000c2e90	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c2e95	movq	0x10(%r15), %rcx
00000000000c2e99	movq	%rax, 0x10(%rcx)
00000000000c2e9d	movq	%rbx, (%rcx)
00000000000c2ea0	movq	%rax, (%r15)
00000000000c2ea3	jmp	0xc2ead
00000000000c2ea5	movq	%r15, %rdi
00000000000c2ea8	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2ead	addq	$0xc, 0x8(%r15)
00000000000c2eb2	movq	(%r15), %rax
00000000000c2eb5	movabsq	$0x43676172465f6768, %rcx       ## imm = 0x43676172465F6768
00000000000c2ebf	movq	%rcx, (%rax,%r14)
00000000000c2ec3	movl	$0x726f6c6f, 0x8(%rax,%r14)     ## imm = 0x726F6C6F
00000000000c2ecc	addq	$0xc, %r12
00000000000c2ed0	jmp	0xc25b5
00000000000c2ed5	movq	%r12, %rdi
00000000000c2ed8	movq	%r15, %rsi
00000000000c2edb	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2ee0	movq	-0x30(%rbp), %rsi
00000000000c2ee4	addq	%rbx, 0x8(%r12)
00000000000c2ee9	addq	(%r12), %r14
00000000000c2eed	movq	%r14, %rdi
00000000000c2ef0	movq	%rbx, %rdx
00000000000c2ef3	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c2ef8	movzbl	(%r13), %ecx
00000000000c2efd	leal	-0x3a(%rcx), %eax
00000000000c2f00	cmpb	$-0xa, %al
00000000000c2f02	movq	%r12, %r15
00000000000c2f05	jae	0xc2f0d
00000000000c2f07	xorl	%esi, %esi
00000000000c2f09	xorl	%eax, %eax
00000000000c2f0b	jmp	0xc2f2d
00000000000c2f0d	xorl	%esi, %esi
00000000000c2f0f	movq	%r13, %rax
00000000000c2f12	leal	(%rsi,%rsi,4), %edx
00000000000c2f15	movzbl	%cl, %ecx
00000000000c2f18	leal	(%rcx,%rdx,2), %esi
00000000000c2f1b	addl	$-0x30, %esi
00000000000c2f1e	movzbl	0x1(%rax), %ecx
00000000000c2f22	incq	%rax
00000000000c2f25	leal	-0x3a(%rcx), %edx
00000000000c2f28	cmpb	$-0xb, %dl
00000000000c2f2b	ja	0xc2f12
00000000000c2f2d	movq	%rsi, -0x38(%rbp)
00000000000c2f31	testq	%rax, %rax
00000000000c2f34	cmovneq	%rax, %r13
00000000000c2f38	movq	-0x60(%rbp), %rax
00000000000c2f3c	movl	0x8(%rax), %ebx
00000000000c2f3f	addl	%esi, %ebx
00000000000c2f41	movq	0x8(%r15), %r14
00000000000c2f45	movq	0x10(%r15), %rax
00000000000c2f49	leaq	0x14(%r14), %rsi
00000000000c2f4d	testq	%rax, %rax
00000000000c2f50	jne	0xc20fe
00000000000c2f56	movq	%r15, %rdi
00000000000c2f59	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c2f5e	addq	(%r15), %r14
00000000000c2f61	movq	%r14, %rdi
00000000000c2f64	movl	%ebx, %esi
00000000000c2f66	callq	__ZL4itoaPci                    ## itoa(char*, int)
00000000000c2f6b	addq	%rax, 0x8(%r15)
00000000000c2f6f	movq	%r13, %rsi
00000000000c2f72	movzbl	(%r13), %eax
00000000000c2f77	jmp	0xc2236
00000000000c2f7c	cmpl	$-0x1, -0x58(%rbp)
00000000000c2f80	je	0xc3038
00000000000c2f86	movq	-0x38(%rbp), %rax
00000000000c2f8a	subl	-0x58(%rbp), %eax
00000000000c2f8d	jb	0xc3038
00000000000c2f93	cmpl	$-0x1, %eax
00000000000c2f96	je	0xc3038
00000000000c2f9c	testq	%r15, %r15
00000000000c2f9f	cmovneq	%r15, %r12
00000000000c2fa3	movq	%r12, %rbx
00000000000c2fa6	subq	%rsi, %rbx
00000000000c2fa9	movq	%r12, %r14
00000000000c2fac	movq	-0x50(%rbp), %r15
00000000000c2fb0	leaq	0x822170(%rip), %r13            ## literal pool for: "varying"
00000000000c2fb7	jmp	0xc2fbf
00000000000c2fb9	decq	%r14
00000000000c2fbc	decq	%rbx
00000000000c2fbf	cmpb	$0x76, (%r14)
00000000000c2fc3	jne	0xc2fb9
00000000000c2fc5	movl	$0x7, %edx
00000000000c2fca	movq	%r14, %rdi
00000000000c2fcd	movq	%r13, %rsi
00000000000c2fd0	callq	0x3c5618                        ## symbol stub for: _strncmp
00000000000c2fd5	movq	-0x30(%rbp), %rdx
00000000000c2fd9	testl	%eax, %eax
00000000000c2fdb	jne	0xc2fb9
00000000000c2fdd	movq	0x8(%r15), %r14
00000000000c2fe1	movq	0x10(%r15), %rax
00000000000c2fe5	leaq	(%r14,%rbx), %rsi
00000000000c2fe9	testq	%rax, %rax
00000000000c2fec	je	0xc3177
00000000000c2ff2	cmpq	(%rax), %rsi
00000000000c2ff5	jb	0xc3183
00000000000c2ffb	leaq	(%r14,%rbx), %r15
00000000000c2fff	addq	$0xff, %r15
00000000000c3006	andq	$-0x100, %r15
00000000000c300d	movq	0x10(%rax), %rdi
00000000000c3011	movq	%r15, %rsi
00000000000c3014	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c3019	movq	-0x30(%rbp), %rdx
00000000000c301d	movq	-0x50(%rbp), %rcx
00000000000c3021	movq	0x10(%rcx), %rcx
00000000000c3025	movq	%rax, 0x10(%rcx)
00000000000c3029	movq	%r15, (%rcx)
00000000000c302c	movq	-0x50(%rbp), %r15
00000000000c3030	movq	%rax, (%r15)
00000000000c3033	jmp	0xc3183
00000000000c3038	movq	%r13, %rbx
00000000000c303b	subq	%rsi, %rbx
00000000000c303e	movq	-0x50(%rbp), %r12
00000000000c3042	movq	0x8(%r12), %r14
00000000000c3047	movq	0x10(%r12), %rax
00000000000c304c	leaq	(%r14,%rbx), %rcx
00000000000c3050	testq	%rax, %rax
00000000000c3053	je	0xc3092
00000000000c3055	cmpq	(%rax), %rcx
00000000000c3058	jb	0xc30a1
00000000000c305a	addq	$0xff, %rcx
00000000000c3061	andq	$-0x100, %rcx
00000000000c3068	movq	%rcx, -0x40(%rbp)
00000000000c306c	movq	0x10(%rax), %rdi
00000000000c3070	movq	%rcx, %rsi
00000000000c3073	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c3078	movq	-0x30(%rbp), %rsi
00000000000c307c	movq	0x10(%r12), %rcx
00000000000c3081	movq	%rax, 0x10(%rcx)
00000000000c3085	movq	-0x40(%rbp), %rdx
00000000000c3089	movq	%rdx, (%rcx)
00000000000c308c	movq	%rax, (%r12)
00000000000c3090	jmp	0xc30a1
00000000000c3092	movq	%r12, %rdi
00000000000c3095	movq	%rcx, %rsi
00000000000c3098	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c309d	movq	-0x30(%rbp), %rsi
00000000000c30a1	addq	%rbx, 0x8(%r12)
00000000000c30a6	addq	(%r12), %r14
00000000000c30aa	movq	%r14, %rdi
00000000000c30ad	movq	%rbx, %rdx
00000000000c30b0	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c30b5	movq	-0x60(%rbp), %rax
00000000000c30b9	movl	0x8(%rax), %ebx
00000000000c30bc	addl	-0x38(%rbp), %ebx
00000000000c30bf	movq	0x8(%r12), %r14
00000000000c30c4	movq	0x10(%r12), %rax
00000000000c30c9	leaq	0x14(%r14), %rsi
00000000000c30cd	testq	%rax, %rax
00000000000c30d0	je	0xc3108
00000000000c30d2	cmpq	(%rax), %rsi
00000000000c30d5	jb	0xc3110
00000000000c30d7	leaq	0x113(%r14), %rsi
00000000000c30de	andq	$-0x100, %rsi
00000000000c30e5	movq	%rsi, -0x40(%rbp)
00000000000c30e9	movq	0x10(%rax), %rdi
00000000000c30ed	callq	0x3c55ca                        ## symbol stub for: _realloc
00000000000c30f2	movq	0x10(%r12), %rcx
00000000000c30f7	movq	%rax, 0x10(%rcx)
00000000000c30fb	movq	-0x40(%rbp), %rdx
00000000000c30ff	movq	%rdx, (%rcx)
00000000000c3102	movq	%rax, (%r12)
00000000000c3106	jmp	0xc3110
00000000000c3108	movq	%r12, %rdi
00000000000c310b	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c3110	addq	(%r12), %r14
00000000000c3114	movq	%r14, %rdi
00000000000c3117	movl	%ebx, %esi
00000000000c3119	callq	__ZL4itoaPci                    ## itoa(char*, int)
00000000000c311e	addq	%rax, 0x8(%r12)
00000000000c3123	testq	%r15, %r15
00000000000c3126	cmovneq	%r15, %r13
00000000000c312a	movq	%r13, %rsi
00000000000c312d	movq	%r12, %r15
00000000000c3130	movzbl	(%r13), %eax
00000000000c3135	jmp	0xc2236
00000000000c313a	movq	%r15, %rdi
00000000000c313d	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c3142	movq	-0x30(%rbp), %rdx
00000000000c3146	addq	%rbx, 0x8(%r15)
00000000000c314a	addq	(%r15), %r14
00000000000c314d	movq	%r14, %rdi
00000000000c3150	movq	%rdx, %rsi
00000000000c3153	movq	%rbx, %rdx
00000000000c3156	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c315b	movzbl	(%r12), %eax
00000000000c3160	testl	%eax, %eax
00000000000c3162	je	0xc31b2
00000000000c3164	cmpl	$0x3b, %eax
00000000000c3167	je	0xc31b2
00000000000c3169	incq	%r12
00000000000c316c	movzbl	(%r12), %eax
00000000000c3171	testl	%eax, %eax
00000000000c3173	jne	0xc3164
00000000000c3175	jmp	0xc31b2
00000000000c3177	movq	%r15, %rdi
00000000000c317a	callq	__ZL9str_allocR8string_tm       ## str_alloc(string_t&, unsigned long)
00000000000c317f	movq	-0x30(%rbp), %rdx
00000000000c3183	addq	%rbx, 0x8(%r15)
00000000000c3187	addq	(%r15), %r14
00000000000c318a	movq	%r14, %rdi
00000000000c318d	movq	%rdx, %rsi
00000000000c3190	movq	%rbx, %rdx
00000000000c3193	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000000c3198	movzbl	(%r12), %eax
00000000000c319d	testl	%eax, %eax
00000000000c319f	je	0xc31b2
00000000000c31a1	cmpl	$0x3b, %eax
00000000000c31a4	je	0xc31b2
00000000000c31a6	incq	%r12
00000000000c31a9	movzbl	(%r12), %eax
00000000000c31ae	testl	%eax, %eax
00000000000c31b0	jne	0xc31a1
00000000000c31b2	xorl	%ecx, %ecx
00000000000c31b4	cmpb	$0x3b, %al
00000000000c31b6	sete	%cl
00000000000c31b9	xorl	%eax, %eax
00000000000c31bb	cmpb	$0xa, (%r12,%rcx)
00000000000c31c0	sete	%al
00000000000c31c3	addq	%rcx, %r12
00000000000c31c6	addq	%rax, %r12
00000000000c31c9	jmp	0xc25b5
00000000000c31ce	subq	%rsi, %r12
00000000000c31d1	movq	%r15, %rdi
00000000000c31d4	movq	%r12, %rdx
00000000000c31d7	callq	__ZL8str_putsR8string_tPKcm     ## str_puts(string_t&, char const*, unsigned long)
00000000000c31dc	movl	$0x1b, %esi
00000000000c31e1	movl	$0x1b, %edx
00000000000c31e6	movq	%r15, %rdi
00000000000c31e9	callq	__ZL7str_extR8string_tmm        ## str_ext(string_t&, unsigned long, unsigned long)
00000000000c31ee	movups	0x821f8a(%rip), %xmm0           ## literal pool for: "    return hg_FragColor;\n}\n"
00000000000c31f5	movups	%xmm0, (%rax)
00000000000c31f8	movups	0x821f8b(%rip), %xmm0           ## literal pool for: "hg_FragColor;\n}\n"
00000000000c31ff	movups	%xmm0, 0xb(%rax)
00000000000c3203	jmp	0xc322a
00000000000c3205	subq	%rsi, %r12
00000000000c3208	movq	%r15, %rdi
00000000000c320b	movq	%r12, %rdx
00000000000c320e	callq	__ZL8str_putsR8string_tPKcm     ## str_puts(string_t&, char const*, unsigned long)
00000000000c3213	movl	$0x2, %esi
00000000000c3218	movl	$0x2, %edx
00000000000c321d	movq	%r15, %rdi
00000000000c3220	callq	__ZL7str_extR8string_tmm        ## str_ext(string_t&, unsigned long, unsigned long)
00000000000c3225	movw	$0xa7d, (%rax)                  ## imm = 0xA7D
00000000000c322a	addq	$0x58, %rsp
00000000000c322e	popq	%rbx
00000000000c322f	popq	%r12
00000000000c3231	popq	%r13
00000000000c3233	popq	%r14
00000000000c3235	popq	%r15
00000000000c3237	popq	%rbp
00000000000c3238	retq
00000000000c3239	nopl	(%rax)
00000000000c323c	popq	%rdx
00000000000c323d	.byte 0xea #bad opcode
00000000000c323e	.byte 0xff #bad opcode
00000000000c323f	decl	0x47ffffec(%rsi)
00000000000c3245	inl	%dx, %eax
00000000000c3246	.byte 0xff #bad opcode
00000000000c3247	incl	-0x13(%rdi)
00000000000c324a	.byte 0xff #bad opcode
00000000000c324b	incl	-0x13(%rdi)
00000000000c324e	.byte 0xff #bad opcode
00000000000c324f	incl	-0x13(%rdi)
00000000000c3252	.byte 0xff #bad opcode
00000000000c3253	incl	-0x13(%rdi)
00000000000c3256	.byte 0xff #bad opcode
00000000000c3257	incl	-0x13(%rdi)
00000000000c325a	.byte 0xff #bad opcode
00000000000c325b	incl	-0x13(%rdi)
00000000000c325e	.byte 0xff #bad opcode
00000000000c325f	incl	-0x13(%rdi)
00000000000c3262	.byte 0xff #bad opcode
00000000000c3263	incl	-0x13(%rdi)
00000000000c3266	.byte 0xff #bad opcode
00000000000c3267	incl	-0x13(%rdi)
00000000000c326a	.byte 0xff #bad opcode
00000000000c326b	incl	-0x13(%rdi)
00000000000c326e	.byte 0xff #bad opcode
00000000000c326f	incl	-0x13(%rdi)
00000000000c3272	.byte 0xff #bad opcode
00000000000c3273	incl	-0x13(%rdi)
00000000000c3276	.byte 0xff #bad opcode
00000000000c3277	incl	-0x13(%rdi)
00000000000c327a	.byte 0xff #bad opcode
00000000000c327b	incl	-0x13(%rdi)
00000000000c327e	.byte 0xff #bad opcode
00000000000c327f	incl	-0x13(%rdi)
00000000000c3282	.byte 0xff #bad opcode
00000000000c3283	incl	-0x13(%rdi)
00000000000c3286	.byte 0xff #bad opcode
00000000000c3287	incl	-0x13(%rdi)
00000000000c328a	.byte 0xff #bad opcode
00000000000c328b	lcalll	*(%rax)
00000000000c328d	inb	%dx, %al
00000000000c328e	.byte 0xff #bad opcode
00000000000c328f	incl	-0x13(%rdi)
00000000000c3292	.byte 0xff #bad opcode
00000000000c3293	jmpq	*(%rdx)
00000000000c3295	inl	%dx, %eax
00000000000c3296	.byte 0xff #bad opcode
00000000000c3297	decl	(%rdi)
00000000000c3299	.byte 0x1f #bad opcode
00000000000c329a	testb	%al, (%rax)
00000000000c329c	addb	%al, (%rax)
00000000000c329e	addb	%al, (%rax)
