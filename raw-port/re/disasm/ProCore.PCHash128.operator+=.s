__ZN9PCHash128pLERKS_:
000000000001c938	movq	%rdi, %rax
000000000001c93b	movl	(%rdi), %edi
000000000001c93d	movl	0x4(%rax), %ecx
000000000001c940	movl	%ecx, %r8d
000000000001c943	orl	%edi, %r8d
000000000001c946	movl	0x8(%rax), %r9d
000000000001c94a	orl	%r9d, %r8d
000000000001c94d	movl	0xc(%rax), %edx
000000000001c950	orl	%edx, %r8d
000000000001c953	jne	0x1c974
000000000001c955	movaps	0x106cd4(%rip), %xmm0
000000000001c95c	movups	%xmm0, (%rax)
000000000001c95f	movl	$0x67452301, %edi               ## imm = 0x67452301
000000000001c964	movl	$0xefcdab89, %ecx               ## imm = 0xEFCDAB89
000000000001c969	movl	$0x98badcfe, %r9d               ## imm = 0x98BADCFE
000000000001c96f	movl	$0x10325476, %edx               ## imm = 0x10325476
000000000001c974	pushq	%rbp
000000000001c975	movq	%rsp, %rbp
000000000001c978	pushq	%r15
000000000001c97a	pushq	%r14
000000000001c97c	pushq	%r13
000000000001c97e	pushq	%r12
000000000001c980	pushq	%rbx
000000000001c981	movq	%rdx, -0x38(%rbp)
000000000001c985	movq	%rdi, -0x40(%rbp)
000000000001c989	movl	(%rsi), %r11d
000000000001c98c	movl	0x4(%rsi), %r10d
000000000001c990	movl	0x8(%rsi), %r15d
000000000001c994	movq	%r15, -0x30(%rbp)
000000000001c998	movl	%r9d, %r8d
000000000001c99b	xorl	%edx, %r8d
000000000001c99e	andl	%ecx, %r8d
000000000001c9a1	xorl	%edx, %r8d
000000000001c9a4	leal	(%rdi,%r11), %ebx
000000000001c9a8	addl	%r8d, %ebx
000000000001c9ab	addl	$0xd76aa478, %ebx               ## imm = 0xD76AA478
000000000001c9b1	roll	$0x7, %ebx
000000000001c9b4	movl	0xc(%rsi), %esi
000000000001c9b7	addl	%ecx, %ebx
000000000001c9b9	movl	%ecx, %r8d
000000000001c9bc	xorl	%r9d, %r8d
000000000001c9bf	andl	%ebx, %r8d
000000000001c9c2	xorl	%r9d, %r8d
000000000001c9c5	leal	(%rdx,%r10), %r14d
000000000001c9c9	addl	%r8d, %r14d
000000000001c9cc	addl	$0xe8c7b756, %r14d              ## imm = 0xE8C7B756
000000000001c9d3	roll	$0xc, %r14d
000000000001c9d7	addl	%ebx, %r14d
000000000001c9da	movl	%ebx, %r8d
000000000001c9dd	xorl	%ecx, %r8d
000000000001c9e0	andl	%r14d, %r8d
000000000001c9e3	xorl	%ecx, %r8d
000000000001c9e6	addl	%r9d, %r15d
000000000001c9e9	addl	%r8d, %r15d
000000000001c9ec	addl	$0x242070db, %r15d              ## imm = 0x242070DB
000000000001c9f3	roll	$0x11, %r15d
000000000001c9f7	addl	%r14d, %r15d
000000000001c9fa	movl	%r14d, %r8d
000000000001c9fd	xorl	%ebx, %r8d
000000000001ca00	andl	%r15d, %r8d
000000000001ca03	xorl	%ebx, %r8d
000000000001ca06	leal	(%rcx,%rsi), %r12d
000000000001ca0a	addl	%r8d, %r12d
000000000001ca0d	addl	$0xc1bdceee, %r12d              ## imm = 0xC1BDCEEE
000000000001ca14	roll	$0x16, %r12d
000000000001ca18	addl	%r15d, %r12d
000000000001ca1b	movl	%r15d, %r8d
000000000001ca1e	xorl	%r14d, %r8d
000000000001ca21	andl	%r12d, %r8d
000000000001ca24	xorl	%r14d, %r8d
000000000001ca27	addl	%r8d, %ebx
000000000001ca2a	addl	$0x757c0faf, %ebx               ## imm = 0x757C0FAF
000000000001ca30	roll	$0x7, %ebx
000000000001ca33	addl	%r12d, %ebx
000000000001ca36	movl	%r12d, %r8d
000000000001ca39	xorl	%r15d, %r8d
000000000001ca3c	andl	%ebx, %r8d
000000000001ca3f	xorl	%r15d, %r8d
000000000001ca42	addl	%r8d, %r14d
000000000001ca45	addl	$0x4787c62a, %r14d              ## imm = 0x4787C62A
000000000001ca4c	roll	$0xc, %r14d
000000000001ca50	addl	%ebx, %r14d
000000000001ca53	movl	%ebx, %r8d
000000000001ca56	xorl	%r12d, %r8d
000000000001ca59	andl	%r14d, %r8d
000000000001ca5c	xorl	%r12d, %r8d
000000000001ca5f	addl	%r8d, %r15d
000000000001ca62	addl	$0xa8304613, %r15d              ## imm = 0xA8304613
000000000001ca69	roll	$0x11, %r15d
000000000001ca6d	addl	%r14d, %r15d
000000000001ca70	movl	%r14d, %r8d
000000000001ca73	xorl	%ebx, %r8d
000000000001ca76	andl	%r15d, %r8d
000000000001ca79	xorl	%ebx, %r8d
000000000001ca7c	addl	%r8d, %r12d
000000000001ca7f	addl	$0xfd469501, %r12d              ## imm = 0xFD469501
000000000001ca86	roll	$0x16, %r12d
000000000001ca8a	addl	%r15d, %r12d
000000000001ca8d	movl	%r15d, %r8d
000000000001ca90	xorl	%r14d, %r8d
000000000001ca93	andl	%r12d, %r8d
000000000001ca96	xorl	%r14d, %r8d
000000000001ca99	leal	(%r8,%rbx), %r13d
000000000001ca9d	addl	$0x698098d8, %r13d              ## imm = 0x698098D8
000000000001caa4	roll	$0x7, %r13d
000000000001caa8	addl	%r12d, %r13d
000000000001caab	movl	%r12d, %r8d
000000000001caae	xorl	%r15d, %r8d
000000000001cab1	andl	%r13d, %r8d
000000000001cab4	xorl	%r15d, %r8d
000000000001cab7	addl	%r8d, %r14d
000000000001caba	addl	$0x8b44f7af, %r14d              ## imm = 0x8B44F7AF
000000000001cac1	roll	$0xc, %r14d
000000000001cac5	addl	%r13d, %r14d
000000000001cac8	movl	%r13d, %r8d
000000000001cacb	xorl	%r12d, %r8d
000000000001cace	andl	%r14d, %r8d
000000000001cad1	xorl	%r12d, %r8d
000000000001cad4	addl	%r8d, %r15d
000000000001cad7	addl	$0xffff5bb1, %r15d              ## imm = 0xFFFF5BB1
000000000001cade	roll	$0x11, %r15d
000000000001cae2	addl	%r14d, %r15d
000000000001cae5	movl	%r14d, %r8d
000000000001cae8	xorl	%r13d, %r8d
000000000001caeb	andl	%r15d, %r8d
000000000001caee	xorl	%r13d, %r8d
000000000001caf1	leal	(%r8,%r12), %edi
000000000001caf5	addl	$0x895cd7be, %edi               ## imm = 0x895CD7BE
000000000001cafb	roll	$0x16, %edi
000000000001cafe	addl	%r15d, %edi
000000000001cb01	movl	%r15d, %r8d
000000000001cb04	xorl	%r14d, %r8d
000000000001cb07	andl	%edi, %r8d
000000000001cb0a	xorl	%r14d, %r8d
000000000001cb0d	leal	(%r8,%r13), %r12d
000000000001cb11	addl	$0x6b901122, %r12d              ## imm = 0x6B901122
000000000001cb18	roll	$0x7, %r12d
000000000001cb1c	addl	%edi, %r12d
000000000001cb1f	movl	%edi, %r8d
000000000001cb22	xorl	%r15d, %r8d
000000000001cb25	andl	%r12d, %r8d
000000000001cb28	xorl	%r15d, %r8d
000000000001cb2b	addl	%r8d, %r14d
000000000001cb2e	addl	$0xfd987193, %r14d              ## imm = 0xFD987193
000000000001cb35	roll	$0xc, %r14d
000000000001cb39	addl	%r12d, %r14d
000000000001cb3c	movl	%r14d, %r8d
000000000001cb3f	andl	%r12d, %r8d
000000000001cb42	movl	%r14d, %r13d
000000000001cb45	notl	%r13d
000000000001cb48	movl	%edi, %ebx
000000000001cb4a	andl	%r13d, %ebx
000000000001cb4d	orl	%r8d, %ebx
000000000001cb50	leal	(%r15,%rbx), %r8d
000000000001cb54	addl	$0xa679438e, %r8d               ## imm = 0xA679438E
000000000001cb5b	roll	$0x11, %r8d
000000000001cb5f	addl	%r14d, %r8d
000000000001cb62	movl	%r8d, %ebx
000000000001cb65	andl	%r14d, %ebx
000000000001cb68	movl	%r8d, %r15d
000000000001cb6b	notl	%r15d
000000000001cb6e	leal	(%r10,%r12), %edx
000000000001cb72	andl	%r15d, %r12d
000000000001cb75	orl	%ebx, %r12d
000000000001cb78	leal	(%rdi,%r12), %ebx
000000000001cb7c	addl	$0x49b40821, %ebx               ## imm = 0x49B40821
000000000001cb82	roll	$0x16, %ebx
000000000001cb85	addl	%r8d, %ebx
000000000001cb88	movl	%ebx, %edi
000000000001cb8a	andl	%r14d, %edi
000000000001cb8d	andl	%r8d, %r13d
000000000001cb90	orl	%edi, %r13d
000000000001cb93	leal	(%rdx,%r13), %r12d
000000000001cb97	addl	$0xf61e2562, %r12d              ## imm = 0xF61E2562
000000000001cb9e	roll	$0x5, %r12d
000000000001cba2	addl	%ebx, %r12d
000000000001cba5	movl	%r12d, %edx
000000000001cba8	andl	%r8d, %edx
000000000001cbab	andl	%ebx, %r15d
000000000001cbae	orl	%edx, %r15d
000000000001cbb1	addl	%r15d, %r14d
000000000001cbb4	addl	$0xc040b340, %r14d              ## imm = 0xC040B340
000000000001cbbb	roll	$0x9, %r14d
000000000001cbbf	addl	%r12d, %r14d
000000000001cbc2	movl	%r14d, %edx
000000000001cbc5	xorl	%r12d, %edx
000000000001cbc8	andl	%ebx, %edx
000000000001cbca	xorl	%r12d, %edx
000000000001cbcd	leal	(%rdx,%r8), %r15d
000000000001cbd1	addl	$0x265e5a51, %r15d              ## imm = 0x265E5A51
000000000001cbd8	roll	$0xe, %r15d
000000000001cbdc	addl	%r14d, %r15d
000000000001cbdf	movl	%r15d, %edx
000000000001cbe2	xorl	%r14d, %edx
000000000001cbe5	andl	%r12d, %edx
000000000001cbe8	xorl	%r14d, %edx
000000000001cbeb	addl	%r11d, %ebx
000000000001cbee	addl	%edx, %ebx
000000000001cbf0	addl	$0xe9b6c7aa, %ebx               ## imm = 0xE9B6C7AA
000000000001cbf6	roll	$0x14, %ebx
000000000001cbf9	addl	%r15d, %ebx
000000000001cbfc	movl	%ebx, %edx
000000000001cbfe	xorl	%r15d, %edx
000000000001cc01	andl	%r14d, %edx
000000000001cc04	xorl	%r15d, %edx
000000000001cc07	addl	%edx, %r12d
000000000001cc0a	addl	$0xd62f105d, %r12d              ## imm = 0xD62F105D
000000000001cc11	roll	$0x5, %r12d
000000000001cc15	addl	%ebx, %r12d
000000000001cc18	movl	%r12d, %edx
000000000001cc1b	xorl	%ebx, %edx
000000000001cc1d	andl	%r15d, %edx
000000000001cc20	xorl	%ebx, %edx
000000000001cc22	leal	(%rdx,%r14), %r13d
000000000001cc26	addl	$0x2441453, %r13d               ## imm = 0x2441453
000000000001cc2d	roll	$0x9, %r13d
000000000001cc31	addl	%r12d, %r13d
000000000001cc34	movl	%r13d, %edx
000000000001cc37	xorl	%r12d, %edx
000000000001cc3a	andl	%ebx, %edx
000000000001cc3c	xorl	%r12d, %edx
000000000001cc3f	leal	(%rdx,%r15), %r14d
000000000001cc43	addl	$0xd8a1e681, %r14d              ## imm = 0xD8A1E681
000000000001cc4a	roll	$0xe, %r14d
000000000001cc4e	addl	%r13d, %r14d
000000000001cc51	movl	%r14d, %edx
000000000001cc54	xorl	%r13d, %edx
000000000001cc57	andl	%r12d, %edx
000000000001cc5a	xorl	%r13d, %edx
000000000001cc5d	leal	(%rdx,%rbx), %r15d
000000000001cc61	addl	$0x67d3fbc8, %r15d              ## imm = 0x67D3FBC8
000000000001cc68	roll	$0x14, %r15d
000000000001cc6c	addl	%r14d, %r15d
000000000001cc6f	movl	%r15d, %edx
000000000001cc72	xorl	%r14d, %edx
000000000001cc75	andl	%r13d, %edx
000000000001cc78	xorl	%r14d, %edx
000000000001cc7b	addl	%edx, %r12d
000000000001cc7e	addl	$0x21e1cde6, %r12d              ## imm = 0x21E1CDE6
000000000001cc85	roll	$0x5, %r12d
000000000001cc89	addl	%r15d, %r12d
000000000001cc8c	movl	%r12d, %edx
000000000001cc8f	xorl	%r15d, %edx
000000000001cc92	andl	%r14d, %edx
000000000001cc95	xorl	%r15d, %edx
000000000001cc98	leal	(%rdx,%r13), %ebx
000000000001cc9c	addl	$0xc33707d6, %ebx               ## imm = 0xC33707D6
000000000001cca2	roll	$0x9, %ebx
000000000001cca5	addl	%r12d, %ebx
000000000001cca8	movl	%ebx, %edx
000000000001ccaa	xorl	%r12d, %edx
000000000001ccad	andl	%r15d, %edx
000000000001ccb0	xorl	%r12d, %edx
000000000001ccb3	addl	%esi, %r14d
000000000001ccb6	addl	%edx, %r14d
000000000001ccb9	addl	$0xf4d50d87, %r14d              ## imm = 0xF4D50D87
000000000001ccc0	roll	$0xe, %r14d
000000000001ccc4	addl	%ebx, %r14d
000000000001ccc7	movl	%r14d, %edx
000000000001ccca	xorl	%ebx, %edx
000000000001cccc	andl	%r12d, %edx
000000000001cccf	xorl	%ebx, %edx
000000000001ccd1	addl	%edx, %r15d
000000000001ccd4	addl	$0x455a14ed, %r15d              ## imm = 0x455A14ED
000000000001ccdb	roll	$0x14, %r15d
000000000001ccdf	addl	%r14d, %r15d
000000000001cce2	movl	%r15d, %edx
000000000001cce5	xorl	%r14d, %edx
000000000001cce8	andl	%ebx, %edx
000000000001ccea	xorl	%r14d, %edx
000000000001cced	addl	%edx, %r12d
000000000001ccf0	addl	$0xa9e3e905, %r12d              ## imm = 0xA9E3E905
000000000001ccf7	roll	$0x5, %r12d
000000000001ccfb	addl	%r15d, %r12d
000000000001ccfe	movl	%r12d, %edx
000000000001cd01	xorl	%r15d, %edx
000000000001cd04	andl	%r14d, %edx
000000000001cd07	xorl	%r15d, %edx
000000000001cd0a	movq	-0x30(%rbp), %r8
000000000001cd0e	addl	%r8d, %ebx
000000000001cd11	addl	%edx, %ebx
000000000001cd13	addl	$0xfcefa3f8, %ebx               ## imm = 0xFCEFA3F8
000000000001cd19	roll	$0x9, %ebx
000000000001cd1c	addl	%r12d, %ebx
000000000001cd1f	movl	%ebx, %edx
000000000001cd21	xorl	%r12d, %edx
000000000001cd24	andl	%r15d, %edx
000000000001cd27	xorl	%r12d, %edx
000000000001cd2a	addl	%edx, %r14d
000000000001cd2d	addl	$0x676f02d9, %r14d              ## imm = 0x676F02D9
000000000001cd34	roll	$0xe, %r14d
000000000001cd38	addl	%ebx, %r14d
000000000001cd3b	movl	%r14d, %edx
000000000001cd3e	xorl	%ebx, %edx
000000000001cd40	andl	%r12d, %edx
000000000001cd43	xorl	%ebx, %edx
000000000001cd45	addl	%edx, %r15d
000000000001cd48	addl	$0x8d2a4c8a, %r15d              ## imm = 0x8D2A4C8A
000000000001cd4f	roll	$0x14, %r15d
000000000001cd53	addl	%r14d, %r15d
000000000001cd56	movl	%r15d, %edx
000000000001cd59	xorl	%r14d, %edx
000000000001cd5c	movl	%edx, %edi
000000000001cd5e	xorl	%ebx, %edi
000000000001cd60	addl	%edi, %r12d
000000000001cd63	addl	$0xfffa3942, %r12d              ## imm = 0xFFFA3942
000000000001cd6a	roll	$0x4, %r12d
000000000001cd6e	addl	%r15d, %r12d
000000000001cd71	xorl	%r12d, %edx
000000000001cd74	addl	%edx, %ebx
000000000001cd76	addl	$0x8771f681, %ebx               ## imm = 0x8771F681
000000000001cd7c	roll	$0xb, %ebx
000000000001cd7f	addl	%r12d, %ebx
000000000001cd82	movl	%r12d, %edx
000000000001cd85	xorl	%r15d, %edx
000000000001cd88	xorl	%ebx, %edx
000000000001cd8a	addl	%edx, %r14d
000000000001cd8d	addl	$0x6d9d6122, %r14d              ## imm = 0x6D9D6122
000000000001cd94	roll	$0x10, %r14d
000000000001cd98	addl	%ebx, %r14d
000000000001cd9b	movl	%ebx, %edx
000000000001cd9d	xorl	%r12d, %edx
000000000001cda0	xorl	%r14d, %edx
000000000001cda3	addl	%edx, %r15d
000000000001cda6	addl	$0xfde5380c, %r15d              ## imm = 0xFDE5380C
000000000001cdad	roll	$0x17, %r15d
000000000001cdb1	addl	%r14d, %r15d
000000000001cdb4	movl	%r14d, %edx
000000000001cdb7	xorl	%ebx, %edx
000000000001cdb9	xorl	%r15d, %edx
000000000001cdbc	addl	%r10d, %r12d
000000000001cdbf	leal	(%rdx,%r12), %r13d
000000000001cdc3	addl	$0xa4beea44, %r13d              ## imm = 0xA4BEEA44
000000000001cdca	roll	$0x4, %r13d
000000000001cdce	addl	%r15d, %r13d
000000000001cdd1	movl	%r15d, %edx
000000000001cdd4	xorl	%r14d, %edx
000000000001cdd7	xorl	%r13d, %edx
000000000001cdda	leal	(%rdx,%rbx), %r12d
000000000001cdde	addl	$0xcbdecfa9, %r12d              ## imm = 0xCBDECFA9
000000000001cde5	roll	$0xb, %r12d
000000000001cde9	addl	%r13d, %r12d
000000000001cdec	movl	%r13d, %edx
000000000001cdef	xorl	%r15d, %edx
000000000001cdf2	xorl	%r12d, %edx
000000000001cdf5	leal	(%rdx,%r14), %ebx
000000000001cdf9	addl	$0xf6bb4b60, %ebx               ## imm = 0xF6BB4B60
000000000001cdff	roll	$0x10, %ebx
000000000001ce02	addl	%r12d, %ebx
000000000001ce05	movl	%r12d, %edx
000000000001ce08	xorl	%r13d, %edx
000000000001ce0b	xorl	%ebx, %edx
000000000001ce0d	leal	(%rdx,%r15), %r14d
000000000001ce11	addl	$0xbebfbc70, %r14d              ## imm = 0xBEBFBC70
000000000001ce18	roll	$0x17, %r14d
000000000001ce1c	addl	%ebx, %r14d
000000000001ce1f	movl	%ebx, %edx
000000000001ce21	xorl	%r12d, %edx
000000000001ce24	xorl	%r14d, %edx
000000000001ce27	leal	(%rdx,%r13), %r15d
000000000001ce2b	addl	$0x289b7ec6, %r15d              ## imm = 0x289B7EC6
000000000001ce32	roll	$0x4, %r15d
000000000001ce36	addl	%r14d, %r15d
000000000001ce39	movl	%r14d, %edx
000000000001ce3c	xorl	%ebx, %edx
000000000001ce3e	xorl	%r15d, %edx
000000000001ce41	addl	%r11d, %r12d
000000000001ce44	leal	(%rdx,%r12), %r13d
000000000001ce48	addl	$0xeaa127fa, %r13d              ## imm = 0xEAA127FA
000000000001ce4f	roll	$0xb, %r13d
000000000001ce53	addl	%r15d, %r13d
000000000001ce56	movl	%r15d, %edx
000000000001ce59	xorl	%r14d, %edx
000000000001ce5c	xorl	%r13d, %edx
000000000001ce5f	addl	%esi, %ebx
000000000001ce61	addl	%edx, %ebx
000000000001ce63	addl	$0xd4ef3085, %ebx               ## imm = 0xD4EF3085
000000000001ce69	roll	$0x10, %ebx
000000000001ce6c	addl	%r13d, %ebx
000000000001ce6f	movl	%r13d, %edx
000000000001ce72	xorl	%r15d, %edx
000000000001ce75	xorl	%ebx, %edx
000000000001ce77	addl	%edx, %r14d
000000000001ce7a	addl	$0x4881d05, %r14d               ## imm = 0x4881D05
000000000001ce81	roll	$0x17, %r14d
000000000001ce85	addl	%ebx, %r14d
000000000001ce88	movl	%ebx, %edx
000000000001ce8a	xorl	%r13d, %edx
000000000001ce8d	xorl	%r14d, %edx
000000000001ce90	leal	(%rdx,%r15), %r12d
000000000001ce94	addl	$0xd9d4d039, %r12d              ## imm = 0xD9D4D039
000000000001ce9b	roll	$0x4, %r12d
000000000001ce9f	addl	%r14d, %r12d
000000000001cea2	movl	%r14d, %edx
000000000001cea5	xorl	%ebx, %edx
000000000001cea7	xorl	%r12d, %edx
000000000001ceaa	leal	(%rdx,%r13), %r15d
000000000001ceae	addl	$0xe6db99e5, %r15d              ## imm = 0xE6DB99E5
000000000001ceb5	roll	$0xb, %r15d
000000000001ceb9	addl	%r12d, %r15d
000000000001cebc	movl	%r12d, %edx
000000000001cebf	xorl	%r14d, %edx
000000000001cec2	xorl	%r15d, %edx
000000000001cec5	addl	%edx, %ebx
000000000001cec7	addl	$0x1fa27cf8, %ebx               ## imm = 0x1FA27CF8
000000000001cecd	roll	$0x10, %ebx
000000000001ced0	addl	%r15d, %ebx
000000000001ced3	movl	%r15d, %edx
000000000001ced6	xorl	%r12d, %edx
000000000001ced9	xorl	%ebx, %edx
000000000001cedb	addl	%r8d, %r14d
000000000001cede	movq	%r8, %rdi
000000000001cee1	addl	%edx, %r14d
000000000001cee4	addl	$0xc4ac5665, %r14d              ## imm = 0xC4AC5665
000000000001ceeb	roll	$0x17, %r14d
000000000001ceef	addl	%ebx, %r14d
000000000001cef2	addl	%r11d, %r12d
000000000001cef5	movl	%r15d, %edx
000000000001cef8	notl	%edx
000000000001cefa	orl	%r14d, %edx
000000000001cefd	xorl	%ebx, %edx
000000000001ceff	addl	%edx, %r12d
000000000001cf02	addl	$0xf4292244, %r12d              ## imm = 0xF4292244
000000000001cf09	roll	$0x6, %r12d
000000000001cf0d	addl	%r14d, %r12d
000000000001cf10	movl	%ebx, %edx
000000000001cf12	notl	%edx
000000000001cf14	orl	%r12d, %edx
000000000001cf17	xorl	%r14d, %edx
000000000001cf1a	addl	%edx, %r15d
000000000001cf1d	addl	$0x432aff97, %r15d              ## imm = 0x432AFF97
000000000001cf24	roll	$0xa, %r15d
000000000001cf28	addl	%r12d, %r15d
000000000001cf2b	movl	%r14d, %edx
000000000001cf2e	notl	%edx
000000000001cf30	orl	%r15d, %edx
000000000001cf33	xorl	%r12d, %edx
000000000001cf36	leal	(%rdx,%rbx), %r11d
000000000001cf3a	addl	$0xab9423a7, %r11d              ## imm = 0xAB9423A7
000000000001cf41	roll	$0xf, %r11d
000000000001cf45	addl	%r15d, %r11d
000000000001cf48	movl	%r12d, %edx
000000000001cf4b	notl	%edx
000000000001cf4d	orl	%r11d, %edx
000000000001cf50	xorl	%r15d, %edx
000000000001cf53	addl	%edx, %r14d
000000000001cf56	addl	$0xfc93a039, %r14d              ## imm = 0xFC93A039
000000000001cf5d	roll	$0x15, %r14d
000000000001cf61	addl	%r11d, %r14d
000000000001cf64	addl	%r15d, %esi
000000000001cf67	notl	%r15d
000000000001cf6a	orl	%r14d, %r15d
000000000001cf6d	xorl	%r11d, %r15d
000000000001cf70	leal	(%r15,%r12), %ebx
000000000001cf74	addl	$0x655b59c3, %ebx               ## imm = 0x655B59C3
000000000001cf7a	roll	$0x6, %ebx
000000000001cf7d	addl	%r14d, %ebx
000000000001cf80	movl	%r11d, %edx
000000000001cf83	notl	%edx
000000000001cf85	orl	%ebx, %edx
000000000001cf87	xorl	%r14d, %edx
000000000001cf8a	addl	%edx, %esi
000000000001cf8c	addl	$0x8f0ccc92, %esi               ## imm = 0x8F0CCC92
000000000001cf92	roll	$0xa, %esi
000000000001cf95	addl	%ebx, %esi
000000000001cf97	addl	%r14d, %r10d
000000000001cf9a	notl	%r14d
000000000001cf9d	orl	%esi, %r14d
000000000001cfa0	xorl	%ebx, %r14d
000000000001cfa3	addl	%r14d, %r11d
000000000001cfa6	addl	$0xffeff47d, %r11d              ## imm = 0xFFEFF47D
000000000001cfad	roll	$0xf, %r11d
000000000001cfb1	addl	%esi, %r11d
000000000001cfb4	movl	%ebx, %edx
000000000001cfb6	notl	%edx
000000000001cfb8	orl	%r11d, %edx
000000000001cfbb	xorl	%esi, %edx
000000000001cfbd	addl	%edx, %r10d
000000000001cfc0	addl	$0x85845dd1, %r10d              ## imm = 0x85845DD1
000000000001cfc7	roll	$0x15, %r10d
000000000001cfcb	addl	%r11d, %r10d
000000000001cfce	movl	%esi, %edx
000000000001cfd0	notl	%edx
000000000001cfd2	orl	%r10d, %edx
000000000001cfd5	xorl	%r11d, %edx
000000000001cfd8	addl	%edx, %ebx
000000000001cfda	addl	$0x6fa87e4f, %ebx               ## imm = 0x6FA87E4F
000000000001cfe0	roll	$0x6, %ebx
000000000001cfe3	addl	%r10d, %ebx
000000000001cfe6	movl	%r11d, %edx
000000000001cfe9	notl	%edx
000000000001cfeb	orl	%ebx, %edx
000000000001cfed	xorl	%r10d, %edx
000000000001cff0	addl	%edx, %esi
000000000001cff2	addl	$0xfe2ce6e0, %esi               ## imm = 0xFE2CE6E0
000000000001cff8	roll	$0xa, %esi
000000000001cffb	addl	%ebx, %esi
000000000001cffd	movl	%r10d, %edx
000000000001d000	notl	%edx
000000000001d002	orl	%esi, %edx
000000000001d004	xorl	%ebx, %edx
000000000001d006	leal	(%rdx,%r11), %r14d
000000000001d00a	addl	$0xa3014314, %r14d              ## imm = 0xA3014314
000000000001d011	roll	$0xf, %r14d
000000000001d015	addl	%esi, %r14d
000000000001d018	movl	%ebx, %edx
000000000001d01a	notl	%edx
000000000001d01c	orl	%r14d, %edx
000000000001d01f	xorl	%esi, %edx
000000000001d021	addl	%edx, %r10d
000000000001d024	addl	$0x4e0811a1, %r10d              ## imm = 0x4E0811A1
000000000001d02b	roll	$0x15, %r10d
000000000001d02f	addl	%r14d, %r10d
000000000001d032	movl	%esi, %edx
000000000001d034	notl	%edx
000000000001d036	orl	%r10d, %edx
000000000001d039	xorl	%r14d, %edx
000000000001d03c	leal	(%rdx,%rbx), %r11d
000000000001d040	addl	$0x77537e82, %r11d              ## imm = 0x77537E82
000000000001d047	roll	$0x6, %r11d
000000000001d04b	addl	%r10d, %r11d
000000000001d04e	addl	%r14d, %edi
000000000001d051	notl	%r14d
000000000001d054	orl	%r11d, %r14d
000000000001d057	xorl	%r10d, %r14d
000000000001d05a	addl	%r14d, %esi
000000000001d05d	addl	$0xbd3af235, %esi               ## imm = 0xBD3AF235
000000000001d063	roll	$0xa, %esi
000000000001d066	addl	%r11d, %esi
000000000001d069	movl	%r10d, %edx
000000000001d06c	notl	%edx
000000000001d06e	orl	%esi, %edx
000000000001d070	xorl	%r11d, %edx
000000000001d073	addl	%edi, %edx
000000000001d075	addl	$0x2ad7d2bb, %edx               ## imm = 0x2AD7D2BB
000000000001d07b	roll	$0xf, %edx
000000000001d07e	addl	%esi, %edx
000000000001d080	movl	%r11d, %edi
000000000001d083	notl	%edi
000000000001d085	orl	%edx, %edi
000000000001d087	xorl	%esi, %edi
000000000001d089	addl	%r10d, %edi
000000000001d08c	addl	$0xeb86d391, %edi               ## imm = 0xEB86D391
000000000001d092	addl	-0x40(%rbp), %r11d
000000000001d096	movl	%r11d, (%rax)
000000000001d099	roll	$0x15, %edi
000000000001d09c	addl	%edx, %ecx
000000000001d09e	addl	%edi, %ecx
000000000001d0a0	movl	%ecx, 0x4(%rax)
000000000001d0a3	addl	%r9d, %edx
000000000001d0a6	movl	%edx, 0x8(%rax)
000000000001d0a9	addl	-0x38(%rbp), %esi
000000000001d0ac	movl	%esi, 0xc(%rax)
000000000001d0af	popq	%rbx
000000000001d0b0	popq	%r12
000000000001d0b2	popq	%r13
000000000001d0b4	popq	%r14
000000000001d0b6	popq	%r15
000000000001d0b8	popq	%rbp
000000000001d0b9	retq
