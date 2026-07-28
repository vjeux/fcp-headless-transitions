__ZN17ApplyReflectivity4evalERK12LayerContextR17SurfaceProperties:
00000000001e17f0	pushq	%rbp
00000000001e17f1	movq	%rsp, %rbp
00000000001e17f4	pushq	%r15
00000000001e17f6	pushq	%r14
00000000001e17f8	pushq	%r13
00000000001e17fa	pushq	%r12
00000000001e17fc	pushq	%rbx
00000000001e17fd	subq	$0x58, %rsp
00000000001e1801	movq	%rdx, %rbx
00000000001e1804	movq	%rdi, %r15
00000000001e1807	movq	0x644c2a(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001e180e	movq	(%rax), %rax
00000000001e1811	movq	%rax, -0x30(%rbp)
00000000001e1815	movq	0x10(%rdi), %rdi
00000000001e1819	testq	%rdi, %rdi
00000000001e181c	je	0x1e1827
00000000001e181e	movq	(%rdi), %rax
00000000001e1821	movq	%rbx, %rdx
00000000001e1824	callq	*0x10(%rax)
00000000001e1827	movq	0x8(%r15), %r12
00000000001e182b	leaq	__ZTVN8ProShade4VarTINS_4NodeEEE(%rip), %r13 ## vtable for ProShade::VarT<ProShade::Node>
00000000001e1832	addq	$0x10, %r13
00000000001e1836	movq	%r13, -0x70(%rbp)
00000000001e183a	movq	0x10(%r12), %rax
00000000001e183f	movq	%rax, -0x60(%rbp)
00000000001e1843	leaq	-0x58(%rbp), %rdi
00000000001e1847	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
00000000001e184c	leaq	-0x60(%rbp), %r14
00000000001e1850	cmpq	$0x0, (%r14)
00000000001e1854	je	0x1e187c
00000000001e1856	addq	$0x18, %r12
00000000001e185a	leaq	-0x78(%rbp), %rdi
00000000001e185e	movq	%r12, %rsi
00000000001e1861	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e1866	leaq	-0x78(%rbp), %rsi
00000000001e186a	leaq	-0x58(%rbp), %rdi
00000000001e186e	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
00000000001e1873	leaq	-0x78(%rbp), %rdi
00000000001e1877	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e187c	leaq	0x120(%rbx), %rsi
00000000001e1883	leaq	-0x50(%rbp), %rdi
00000000001e1887	leaq	-0x70(%rbp), %rdx
00000000001e188b	callq	0x6df1da                        ## symbol stub for: __ZN8ProShademlERKNS_4VarTINS_4NodeEEES4_
00000000001e1890	movq	-0x40(%rbp), %rax
00000000001e1894	movq	%rax, 0x130(%rbx)
00000000001e189b	leaq	-0x38(%rbp), %r12
00000000001e189f	leaq	-0x78(%rbp), %rdi
00000000001e18a3	movq	%r12, %rsi
00000000001e18a6	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e18ab	leaq	0x138(%rbx), %rdi
00000000001e18b2	leaq	-0x78(%rbp), %rsi
00000000001e18b6	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
00000000001e18bb	leaq	-0x78(%rbp), %rdi
00000000001e18bf	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e18c4	movq	%r13, -0x50(%rbp)
00000000001e18c8	movq	%r12, %rdi
00000000001e18cb	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e18d0	movq	%r13, -0x70(%rbp)
00000000001e18d4	leaq	-0x58(%rbp), %rdi
00000000001e18d8	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e18dd	movq	0x8(%r15), %r15
00000000001e18e1	movq	%r13, -0x70(%rbp)
00000000001e18e5	movq	0x10(%r15), %rax
00000000001e18e9	movq	%rax, -0x60(%rbp)
00000000001e18ed	leaq	-0x58(%rbp), %r12
00000000001e18f1	movq	%r12, %rdi
00000000001e18f4	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
00000000001e18f9	cmpq	$0x0, (%r14)
00000000001e18fd	je	0x1e1924
00000000001e18ff	addq	$0x18, %r15
00000000001e1903	leaq	-0x78(%rbp), %rdi
00000000001e1907	movq	%r15, %rsi
00000000001e190a	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e190f	leaq	-0x78(%rbp), %rsi
00000000001e1913	movq	%r12, %rdi
00000000001e1916	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
00000000001e191b	leaq	-0x78(%rbp), %rdi
00000000001e191f	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e1924	leaq	0x140(%rbx), %rsi
00000000001e192b	leaq	-0x50(%rbp), %rdi
00000000001e192f	leaq	-0x70(%rbp), %rdx
00000000001e1933	callq	0x6df1da                        ## symbol stub for: __ZN8ProShademlERKNS_4VarTINS_4NodeEEES4_
00000000001e1938	movq	-0x40(%rbp), %rax
00000000001e193c	movq	%rax, 0x150(%rbx)
00000000001e1943	leaq	-0x38(%rbp), %r15
00000000001e1947	leaq	-0x78(%rbp), %rdi
00000000001e194b	movq	%r15, %rsi
00000000001e194e	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e1953	addq	$0x158, %rbx                    ## imm = 0x158
00000000001e195a	leaq	-0x78(%rbp), %rsi
00000000001e195e	movq	%rbx, %rdi
00000000001e1961	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
00000000001e1966	leaq	-0x78(%rbp), %rdi
00000000001e196a	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e196f	movq	%r13, -0x50(%rbp)
00000000001e1973	movq	%r15, %rdi
00000000001e1976	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e197b	movq	%r13, -0x70(%rbp)
00000000001e197f	movq	%r12, %rdi
00000000001e1982	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e1987	movq	0x644aaa(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001e198e	movq	(%rax), %rax
00000000001e1991	cmpq	-0x30(%rbp), %rax
00000000001e1995	jne	0x1e19a6
00000000001e1997	addq	$0x58, %rsp
00000000001e199b	popq	%rbx
00000000001e199c	popq	%r12
00000000001e199e	popq	%r13
00000000001e19a0	popq	%r14
00000000001e19a2	popq	%r15
00000000001e19a4	popq	%rbp
00000000001e19a5	retq
00000000001e19a6	callq	0x6dfd38                        ## symbol stub for: ___stack_chk_fail
00000000001e19ab	movq	%rax, %rbx
00000000001e19ae	leaq	-0x78(%rbp), %rdi
00000000001e19b2	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e19b7	movq	%r12, %rdi
00000000001e19ba	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e19bf	movq	%rbx, %rdi
00000000001e19c2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001e19c7	movq	%rax, %rbx
00000000001e19ca	movq	%r12, %rdi
00000000001e19cd	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e19d2	movq	%rbx, %rdi
00000000001e19d5	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001e19da	movq	%rax, %rbx
00000000001e19dd	leaq	-0x78(%rbp), %rdi
00000000001e19e1	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e19e6	leaq	-0x58(%rbp), %rdi
00000000001e19ea	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e19ef	movq	%rbx, %rdi
00000000001e19f2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001e19f7	movq	%rax, %rbx
00000000001e19fa	leaq	-0x58(%rbp), %rdi
00000000001e19fe	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e1a03	movq	%rbx, %rdi
00000000001e1a06	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001e1a0b	movq	%rax, %rbx
00000000001e1a0e	leaq	-0x78(%rbp), %rdi
00000000001e1a12	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e1a17	jmp	0x1e1a1c
00000000001e1a19	movq	%rax, %rbx
00000000001e1a1c	movq	%r13, -0x50(%rbp)
00000000001e1a20	movq	%r15, %rdi
00000000001e1a23	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e1a28	jmp	0x1e1a2d
00000000001e1a2a	movq	%rax, %rbx
00000000001e1a2d	movq	%r13, -0x70(%rbp)
00000000001e1a31	movq	%r12, %rdi
00000000001e1a34	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e1a39	movq	%rbx, %rdi
00000000001e1a3c	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001e1a41	movq	%rax, %rbx
00000000001e1a44	leaq	-0x78(%rbp), %rdi
00000000001e1a48	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e1a4d	jmp	0x1e1a52
00000000001e1a4f	movq	%rax, %rbx
00000000001e1a52	movq	%r13, -0x50(%rbp)
00000000001e1a56	movq	%r12, %rdi
00000000001e1a59	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e1a5e	jmp	0x1e1a63
00000000001e1a60	movq	%rax, %rbx
00000000001e1a63	movq	%r13, -0x70(%rbp)
00000000001e1a67	leaq	-0x58(%rbp), %rdi
00000000001e1a6b	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e1a70	movq	%rbx, %rdi
00000000001e1a73	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001e1a78	movq	%rax, %rdi
00000000001e1a7b	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
