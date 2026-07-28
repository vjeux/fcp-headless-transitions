__ZN9PCHash1289transformEPKj:
000000000001c1de	pushq	%rbp
000000000001c1df	movq	%rsp, %rbp
000000000001c1e2	pushq	%r15
000000000001c1e4	pushq	%r14
000000000001c1e6	pushq	%r13
000000000001c1e8	pushq	%r12
000000000001c1ea	pushq	%rbx
000000000001c1eb	movq	%rsi, %rbx
000000000001c1ee	movq	%rdi, -0x88(%rbp)
000000000001c1f5	movl	(%rdi), %esi
000000000001c1f7	movq	%rsi, -0xa0(%rbp)
000000000001c1fe	movl	0x4(%rdi), %r11d
000000000001c202	movl	0x8(%rdi), %edx
000000000001c205	movl	0xc(%rdi), %ecx
000000000001c208	movl	(%rbx), %r9d
000000000001c20b	movl	0x4(%rbx), %r8d
000000000001c20f	movl	%edx, %eax
000000000001c211	xorl	%ecx, %eax
000000000001c213	andl	%r11d, %eax
000000000001c216	xorl	%ecx, %eax
000000000001c218	movq	%rcx, %rdi
000000000001c21b	movq	%rcx, -0x98(%rbp)
000000000001c222	leal	(%rsi,%r9), %ecx
000000000001c226	movq	%r9, %r13
000000000001c229	movq	%r9, -0x70(%rbp)
000000000001c22d	addl	%ecx, %eax
000000000001c22f	addl	$0xd76aa478, %eax               ## imm = 0xD76AA478
000000000001c234	roll	$0x7, %eax
000000000001c237	addl	%r11d, %eax
000000000001c23a	movl	%r11d, %ecx
000000000001c23d	xorl	%edx, %ecx
000000000001c23f	andl	%eax, %ecx
000000000001c241	xorl	%edx, %ecx
000000000001c243	movq	%rdx, %rsi
000000000001c246	movq	%rdx, -0x90(%rbp)
000000000001c24d	leal	(%rdi,%r8), %edx
000000000001c251	movq	%r8, %r10
000000000001c254	addl	%edx, %ecx
000000000001c256	addl	$0xe8c7b756, %ecx               ## imm = 0xE8C7B756
000000000001c25c	roll	$0xc, %ecx
000000000001c25f	movl	0x8(%rbx), %edi
000000000001c262	movq	%rdi, -0x78(%rbp)
000000000001c266	addl	%eax, %ecx
000000000001c268	movl	%eax, %edx
000000000001c26a	xorl	%r11d, %edx
000000000001c26d	andl	%ecx, %edx
000000000001c26f	xorl	%r11d, %edx
000000000001c272	movq	%r11, -0x80(%rbp)
000000000001c276	addl	%edi, %esi
000000000001c278	addl	%esi, %edx
000000000001c27a	addl	$0x242070db, %edx               ## imm = 0x242070DB
000000000001c280	roll	$0x11, %edx
000000000001c283	addl	%ecx, %edx
000000000001c285	movl	%ecx, %esi
000000000001c287	xorl	%eax, %esi
000000000001c289	andl	%edx, %esi
000000000001c28b	xorl	%eax, %esi
000000000001c28d	movl	0xc(%rbx), %edi
000000000001c290	movq	%rdi, -0x68(%rbp)
000000000001c294	addl	%r11d, %edi
000000000001c297	leal	(%rsi,%rdi), %r8d
000000000001c29b	addl	$0xc1bdceee, %r8d               ## imm = 0xC1BDCEEE
000000000001c2a2	roll	$0x16, %r8d
000000000001c2a6	addl	%edx, %r8d
000000000001c2a9	movl	%edx, %esi
000000000001c2ab	xorl	%ecx, %esi
000000000001c2ad	andl	%r8d, %esi
000000000001c2b0	xorl	%ecx, %esi
000000000001c2b2	movl	0x10(%rbx), %edi
000000000001c2b5	movl	%edi, -0x40(%rbp)
000000000001c2b8	addl	%edi, %eax
000000000001c2ba	addl	%esi, %eax
000000000001c2bc	addl	$0xf57c0faf, %eax               ## imm = 0xF57C0FAF
000000000001c2c1	roll	$0x7, %eax
000000000001c2c4	addl	%r8d, %eax
000000000001c2c7	movl	%r8d, %esi
000000000001c2ca	xorl	%edx, %esi
000000000001c2cc	andl	%eax, %esi
000000000001c2ce	xorl	%edx, %esi
000000000001c2d0	movl	0x14(%rbx), %edi
000000000001c2d3	movl	%edi, -0x34(%rbp)
000000000001c2d6	addl	%edi, %ecx
000000000001c2d8	addl	%esi, %ecx
000000000001c2da	addl	$0x4787c62a, %ecx               ## imm = 0x4787C62A
000000000001c2e0	roll	$0xc, %ecx
000000000001c2e3	addl	%eax, %ecx
000000000001c2e5	movl	%eax, %esi
000000000001c2e7	xorl	%r8d, %esi
000000000001c2ea	andl	%ecx, %esi
000000000001c2ec	xorl	%r8d, %esi
000000000001c2ef	movl	0x18(%rbx), %r15d
000000000001c2f3	addl	%r15d, %edx
000000000001c2f6	movl	%r15d, -0x54(%rbp)
000000000001c2fa	addl	%esi, %edx
000000000001c2fc	addl	$0xa8304613, %edx               ## imm = 0xA8304613
000000000001c302	roll	$0x11, %edx
000000000001c305	addl	%ecx, %edx
000000000001c307	movl	%ecx, %esi
000000000001c309	xorl	%eax, %esi
000000000001c30b	andl	%edx, %esi
000000000001c30d	xorl	%eax, %esi
000000000001c30f	movl	0x1c(%rbx), %edi
000000000001c312	movl	%edi, -0x50(%rbp)
000000000001c315	addl	%edi, %r8d
000000000001c318	addl	%esi, %r8d
000000000001c31b	addl	$0xfd469501, %r8d               ## imm = 0xFD469501
000000000001c322	roll	$0x16, %r8d
000000000001c326	addl	%edx, %r8d
000000000001c329	movl	%edx, %esi
000000000001c32b	xorl	%ecx, %esi
000000000001c32d	andl	%r8d, %esi
000000000001c330	xorl	%ecx, %esi
000000000001c332	movl	0x20(%rbx), %edi
000000000001c335	movl	%edi, -0x3c(%rbp)
000000000001c338	addl	%edi, %eax
000000000001c33a	leal	(%rsi,%rax), %r12d
000000000001c33e	addl	$0x698098d8, %r12d              ## imm = 0x698098D8
000000000001c345	roll	$0x7, %r12d
000000000001c349	addl	%r8d, %r12d
000000000001c34c	movl	%r8d, %eax
000000000001c34f	xorl	%edx, %eax
000000000001c351	andl	%r12d, %eax
000000000001c354	xorl	%edx, %eax
000000000001c356	movl	0x24(%rbx), %esi
000000000001c359	movl	%esi, -0x2c(%rbp)
000000000001c35c	addl	%esi, %ecx
000000000001c35e	addl	%eax, %ecx
000000000001c360	addl	$0x8b44f7af, %ecx               ## imm = 0x8B44F7AF
000000000001c366	roll	$0xc, %ecx
000000000001c369	addl	%r12d, %ecx
000000000001c36c	movl	%r12d, %eax
000000000001c36f	xorl	%r8d, %eax
000000000001c372	andl	%ecx, %eax
000000000001c374	xorl	%r8d, %eax
000000000001c377	movl	0x28(%rbx), %r11d
000000000001c37b	addl	%r11d, %edx
000000000001c37e	movl	%r11d, -0x48(%rbp)
000000000001c382	addl	%eax, %edx
000000000001c384	addl	$0xffff5bb1, %edx               ## imm = 0xFFFF5BB1
000000000001c38a	roll	$0x11, %edx
000000000001c38d	addl	%ecx, %edx
000000000001c38f	movl	%ecx, %eax
000000000001c391	xorl	%r12d, %eax
000000000001c394	andl	%edx, %eax
000000000001c396	xorl	%r12d, %eax
000000000001c399	movl	0x2c(%rbx), %r14d
000000000001c39d	addl	%r14d, %r8d
000000000001c3a0	leal	(%rax,%r8), %r9d
000000000001c3a4	addl	$0x895cd7be, %r9d               ## imm = 0x895CD7BE
000000000001c3ab	roll	$0x16, %r9d
000000000001c3af	addl	%edx, %r9d
000000000001c3b2	movl	%edx, %eax
000000000001c3b4	xorl	%ecx, %eax
000000000001c3b6	andl	%r9d, %eax
000000000001c3b9	xorl	%ecx, %eax
000000000001c3bb	movl	0x30(%rbx), %esi
000000000001c3be	movl	%esi, -0x44(%rbp)
000000000001c3c1	addl	%esi, %r12d
000000000001c3c4	addl	%r12d, %eax
000000000001c3c7	addl	$0x6b901122, %eax               ## imm = 0x6B901122
000000000001c3cc	roll	$0x7, %eax
000000000001c3cf	addl	%r9d, %eax
000000000001c3d2	movl	%r9d, %esi
000000000001c3d5	xorl	%edx, %esi
000000000001c3d7	andl	%eax, %esi
000000000001c3d9	xorl	%edx, %esi
000000000001c3db	movl	0x34(%rbx), %edi
000000000001c3de	movl	%edi, -0x38(%rbp)
000000000001c3e1	addl	%edi, %ecx
000000000001c3e3	addl	%esi, %ecx
000000000001c3e5	addl	$0xfd987193, %ecx               ## imm = 0xFD987193
000000000001c3eb	roll	$0xc, %ecx
000000000001c3ee	addl	%eax, %ecx
000000000001c3f0	movl	%ecx, %edi
000000000001c3f2	andl	%eax, %edi
000000000001c3f4	movl	%ecx, %esi
000000000001c3f6	notl	%esi
000000000001c3f8	movl	%r9d, %r8d
000000000001c3fb	andl	%esi, %r8d
000000000001c3fe	orl	%edi, %r8d
000000000001c401	movl	0x38(%rbx), %edi
000000000001c404	movl	%edi, -0x30(%rbp)
000000000001c407	addl	%edi, %edx
000000000001c409	addl	%r8d, %edx
000000000001c40c	addl	$0xa679438e, %edx               ## imm = 0xA679438E
000000000001c412	roll	$0x11, %edx
000000000001c415	addl	%ecx, %edx
000000000001c417	movl	%edx, %r8d
000000000001c41a	andl	%ecx, %r8d
000000000001c41d	movl	%edx, %edi
000000000001c41f	notl	%edi
000000000001c421	movq	%r10, -0x60(%rbp)
000000000001c425	addl	%eax, %r10d
000000000001c428	andl	%edi, %eax
000000000001c42a	orl	%r8d, %eax
000000000001c42d	movl	0x3c(%rbx), %ebx
000000000001c430	addl	%ebx, %r9d
000000000001c433	movl	%ebx, -0x4c(%rbp)
000000000001c436	addl	%r9d, %eax
000000000001c439	addl	$0x49b40821, %eax               ## imm = 0x49B40821
000000000001c43e	roll	$0x16, %eax
000000000001c441	addl	%edx, %eax
000000000001c443	movl	%eax, %r8d
000000000001c446	andl	%ecx, %r8d
000000000001c449	andl	%edx, %esi
000000000001c44b	orl	%r8d, %esi
000000000001c44e	addl	%r10d, %esi
000000000001c451	addl	$0xf61e2562, %esi               ## imm = 0xF61E2562
000000000001c457	roll	$0x5, %esi
000000000001c45a	addl	%eax, %esi
000000000001c45c	movl	%esi, %r8d
000000000001c45f	andl	%edx, %r8d
000000000001c462	andl	%eax, %edi
000000000001c464	orl	%r8d, %edi
000000000001c467	addl	%r15d, %ecx
000000000001c46a	addl	%edi, %ecx
000000000001c46c	addl	$0xc040b340, %ecx               ## imm = 0xC040B340
000000000001c472	roll	$0x9, %ecx
000000000001c475	addl	%esi, %ecx
000000000001c477	movl	%ecx, %edi
000000000001c479	xorl	%esi, %edi
000000000001c47b	andl	%eax, %edi
000000000001c47d	xorl	%esi, %edi
000000000001c47f	movl	%r14d, %r12d
000000000001c482	movl	%r14d, -0x58(%rbp)
000000000001c486	addl	%r14d, %edx
000000000001c489	addl	%edi, %edx
000000000001c48b	addl	$0x265e5a51, %edx               ## imm = 0x265E5A51
000000000001c491	roll	$0xe, %edx
000000000001c494	addl	%ecx, %edx
000000000001c496	movl	%edx, %edi
000000000001c498	xorl	%ecx, %edi
000000000001c49a	andl	%esi, %edi
000000000001c49c	xorl	%ecx, %edi
000000000001c49e	addl	%r13d, %eax
000000000001c4a1	addl	%edi, %eax
000000000001c4a3	addl	$0xe9b6c7aa, %eax               ## imm = 0xE9B6C7AA
000000000001c4a8	roll	$0x14, %eax
000000000001c4ab	addl	%edx, %eax
000000000001c4ad	movl	%eax, %edi
000000000001c4af	xorl	%edx, %edi
000000000001c4b1	andl	%ecx, %edi
000000000001c4b3	xorl	%edx, %edi
000000000001c4b5	movl	-0x34(%rbp), %r14d
000000000001c4b9	addl	%r14d, %esi
000000000001c4bc	addl	%edi, %esi
000000000001c4be	addl	$0xd62f105d, %esi               ## imm = 0xD62F105D
000000000001c4c4	roll	$0x5, %esi
000000000001c4c7	addl	%eax, %esi
000000000001c4c9	movl	%esi, %edi
000000000001c4cb	xorl	%eax, %edi
000000000001c4cd	andl	%edx, %edi
000000000001c4cf	xorl	%eax, %edi
000000000001c4d1	addl	%r11d, %ecx
000000000001c4d4	addl	%edi, %ecx
000000000001c4d6	addl	$0x2441453, %ecx                ## imm = 0x2441453
000000000001c4dc	roll	$0x9, %ecx
000000000001c4df	addl	%esi, %ecx
000000000001c4e1	movl	%ecx, %edi
000000000001c4e3	xorl	%esi, %edi
000000000001c4e5	andl	%eax, %edi
000000000001c4e7	xorl	%esi, %edi
000000000001c4e9	addl	%ebx, %edx
000000000001c4eb	addl	%edi, %edx
000000000001c4ed	addl	$0xd8a1e681, %edx               ## imm = 0xD8A1E681
000000000001c4f3	roll	$0xe, %edx
000000000001c4f6	addl	%ecx, %edx
000000000001c4f8	movl	%edx, %edi
000000000001c4fa	xorl	%ecx, %edi
000000000001c4fc	andl	%esi, %edi
000000000001c4fe	xorl	%ecx, %edi
000000000001c500	movl	-0x40(%rbp), %r15d
000000000001c504	addl	%r15d, %eax
000000000001c507	addl	%edi, %eax
000000000001c509	addl	$0xe7d3fbc8, %eax               ## imm = 0xE7D3FBC8
000000000001c50e	roll	$0x14, %eax
000000000001c511	addl	%edx, %eax
000000000001c513	movl	%eax, %edi
000000000001c515	xorl	%edx, %edi
000000000001c517	andl	%ecx, %edi
000000000001c519	xorl	%edx, %edi
000000000001c51b	addl	-0x2c(%rbp), %esi
000000000001c51e	addl	%edi, %esi
000000000001c520	addl	$0x21e1cde6, %esi               ## imm = 0x21E1CDE6
000000000001c526	roll	$0x5, %esi
000000000001c529	addl	%eax, %esi
000000000001c52b	movl	%esi, %edi
000000000001c52d	xorl	%eax, %edi
000000000001c52f	andl	%edx, %edi
000000000001c531	xorl	%eax, %edi
000000000001c533	movl	-0x30(%rbp), %r11d
000000000001c537	addl	%r11d, %ecx
000000000001c53a	addl	%edi, %ecx
000000000001c53c	addl	$0xc33707d6, %ecx               ## imm = 0xC33707D6
000000000001c542	roll	$0x9, %ecx
000000000001c545	addl	%esi, %ecx
000000000001c547	movl	%ecx, %edi
000000000001c549	xorl	%esi, %edi
000000000001c54b	andl	%eax, %edi
000000000001c54d	xorl	%esi, %edi
000000000001c54f	addl	-0x68(%rbp), %edx
000000000001c552	addl	%edi, %edx
000000000001c554	addl	$0xf4d50d87, %edx               ## imm = 0xF4D50D87
000000000001c55a	roll	$0xe, %edx
000000000001c55d	addl	%ecx, %edx
000000000001c55f	movl	%edx, %edi
000000000001c561	xorl	%ecx, %edi
000000000001c563	andl	%esi, %edi
000000000001c565	xorl	%ecx, %edi
000000000001c567	movl	-0x3c(%rbp), %r9d
000000000001c56b	addl	%r9d, %eax
000000000001c56e	addl	%edi, %eax
000000000001c570	addl	$0x455a14ed, %eax               ## imm = 0x455A14ED
000000000001c575	roll	$0x14, %eax
000000000001c578	addl	%edx, %eax
000000000001c57a	movl	%eax, %edi
000000000001c57c	xorl	%edx, %edi
000000000001c57e	andl	%ecx, %edi
000000000001c580	xorl	%edx, %edi
000000000001c582	movl	-0x38(%rbp), %ebx
000000000001c585	addl	%ebx, %esi
000000000001c587	addl	%edi, %esi
000000000001c589	addl	$0xa9e3e905, %esi               ## imm = 0xA9E3E905
000000000001c58f	roll	$0x5, %esi
000000000001c592	addl	%eax, %esi
000000000001c594	movl	%esi, %edi
000000000001c596	xorl	%eax, %edi
000000000001c598	andl	%edx, %edi
000000000001c59a	xorl	%eax, %edi
000000000001c59c	movq	-0x78(%rbp), %r13
000000000001c5a0	addl	%r13d, %ecx
000000000001c5a3	addl	%edi, %ecx
000000000001c5a5	addl	$0xfcefa3f8, %ecx               ## imm = 0xFCEFA3F8
000000000001c5ab	roll	$0x9, %ecx
000000000001c5ae	addl	%esi, %ecx
000000000001c5b0	movl	%ecx, %edi
000000000001c5b2	xorl	%esi, %edi
000000000001c5b4	andl	%eax, %edi
000000000001c5b6	xorl	%esi, %edi
000000000001c5b8	movl	-0x50(%rbp), %r10d
000000000001c5bc	addl	%r10d, %edx
000000000001c5bf	addl	%edx, %edi
000000000001c5c1	addl	$0x676f02d9, %edi               ## imm = 0x676F02D9
000000000001c5c7	roll	$0xe, %edi
000000000001c5ca	addl	%ecx, %edi
000000000001c5cc	movl	%edi, %edx
000000000001c5ce	xorl	%ecx, %edx
000000000001c5d0	andl	%esi, %edx
000000000001c5d2	xorl	%ecx, %edx
000000000001c5d4	addl	-0x44(%rbp), %eax
000000000001c5d7	addl	%eax, %edx
000000000001c5d9	addl	$0x8d2a4c8a, %edx               ## imm = 0x8D2A4C8A
000000000001c5df	roll	$0x14, %edx
000000000001c5e2	addl	%edi, %edx
000000000001c5e4	movl	%edx, %eax
000000000001c5e6	xorl	%edi, %eax
000000000001c5e8	movl	%eax, %r8d
000000000001c5eb	xorl	%ecx, %r8d
000000000001c5ee	addl	%r14d, %esi
000000000001c5f1	addl	%r8d, %esi
000000000001c5f4	addl	$0xfffa3942, %esi               ## imm = 0xFFFA3942
000000000001c5fa	roll	$0x4, %esi
000000000001c5fd	addl	%edx, %esi
000000000001c5ff	xorl	%esi, %eax
000000000001c601	addl	%r9d, %ecx
000000000001c604	addl	%ecx, %eax
000000000001c606	addl	$0x8771f681, %eax               ## imm = 0x8771F681
000000000001c60b	roll	$0xb, %eax
000000000001c60e	addl	%esi, %eax
000000000001c610	movl	%esi, %ecx
000000000001c612	xorl	%edx, %ecx
000000000001c614	xorl	%eax, %ecx
000000000001c616	addl	%r12d, %edi
000000000001c619	addl	%edi, %ecx
000000000001c61b	addl	$0x6d9d6122, %ecx               ## imm = 0x6D9D6122
000000000001c621	roll	$0x10, %ecx
000000000001c624	addl	%eax, %ecx
000000000001c626	movl	%eax, %edi
000000000001c628	xorl	%esi, %edi
000000000001c62a	xorl	%ecx, %edi
000000000001c62c	addl	%r11d, %edx
000000000001c62f	addl	%edi, %edx
000000000001c631	addl	$0xfde5380c, %edx               ## imm = 0xFDE5380C
000000000001c637	roll	$0x17, %edx
000000000001c63a	addl	%ecx, %edx
000000000001c63c	movl	%ecx, %edi
000000000001c63e	xorl	%eax, %edi
000000000001c640	xorl	%edx, %edi
000000000001c642	addl	-0x60(%rbp), %esi
000000000001c645	addl	%edi, %esi
000000000001c647	addl	$0xa4beea44, %esi               ## imm = 0xA4BEEA44
000000000001c64d	roll	$0x4, %esi
000000000001c650	addl	%edx, %esi
000000000001c652	movl	%edx, %edi
000000000001c654	xorl	%ecx, %edi
000000000001c656	xorl	%esi, %edi
000000000001c658	addl	%r15d, %eax
000000000001c65b	addl	%edi, %eax
000000000001c65d	addl	$0x4bdecfa9, %eax               ## imm = 0x4BDECFA9
000000000001c662	roll	$0xb, %eax
000000000001c665	addl	%esi, %eax
000000000001c667	movl	%esi, %edi
000000000001c669	xorl	%edx, %edi
000000000001c66b	xorl	%eax, %edi
000000000001c66d	addl	%r10d, %ecx
000000000001c670	movl	%r10d, %r9d
000000000001c673	addl	%edi, %ecx
000000000001c675	addl	$0xf6bb4b60, %ecx               ## imm = 0xF6BB4B60
000000000001c67b	roll	$0x10, %ecx
000000000001c67e	addl	%eax, %ecx
000000000001c680	movl	%eax, %edi
000000000001c682	xorl	%esi, %edi
000000000001c684	xorl	%ecx, %edi
000000000001c686	movl	-0x48(%rbp), %r10d
000000000001c68a	addl	%r10d, %edx
000000000001c68d	addl	%edi, %edx
000000000001c68f	addl	$0xbebfbc70, %edx               ## imm = 0xBEBFBC70
000000000001c695	roll	$0x17, %edx
000000000001c698	addl	%ecx, %edx
000000000001c69a	movl	%ecx, %edi
000000000001c69c	xorl	%eax, %edi
000000000001c69e	xorl	%edx, %edi
000000000001c6a0	addl	%ebx, %esi
000000000001c6a2	addl	%edi, %esi
000000000001c6a4	addl	$0x289b7ec6, %esi               ## imm = 0x289B7EC6
000000000001c6aa	roll	$0x4, %esi
000000000001c6ad	addl	%edx, %esi
000000000001c6af	movl	%edx, %edi
000000000001c6b1	xorl	%ecx, %edi
000000000001c6b3	xorl	%esi, %edi
000000000001c6b5	movq	-0x70(%rbp), %r8
000000000001c6b9	addl	%r8d, %eax
000000000001c6bc	addl	%edi, %eax
000000000001c6be	addl	$0xeaa127fa, %eax               ## imm = 0xEAA127FA
000000000001c6c3	roll	$0xb, %eax
000000000001c6c6	addl	%esi, %eax
000000000001c6c8	movl	%esi, %edi
000000000001c6ca	xorl	%edx, %edi
000000000001c6cc	xorl	%eax, %edi
000000000001c6ce	movq	-0x68(%rbp), %r11
000000000001c6d2	addl	%r11d, %ecx
000000000001c6d5	addl	%edi, %ecx
000000000001c6d7	addl	$0xd4ef3085, %ecx               ## imm = 0xD4EF3085
000000000001c6dd	roll	$0x10, %ecx
000000000001c6e0	addl	%eax, %ecx
000000000001c6e2	movl	%eax, %edi
000000000001c6e4	xorl	%esi, %edi
000000000001c6e6	xorl	%ecx, %edi
000000000001c6e8	movl	-0x54(%rbp), %ebx
000000000001c6eb	addl	%ebx, %edx
000000000001c6ed	addl	%edi, %edx
000000000001c6ef	addl	$0x4881d05, %edx                ## imm = 0x4881D05
000000000001c6f5	roll	$0x17, %edx
000000000001c6f8	addl	%ecx, %edx
000000000001c6fa	movl	%ecx, %edi
000000000001c6fc	xorl	%eax, %edi
000000000001c6fe	xorl	%edx, %edi
000000000001c700	addl	-0x2c(%rbp), %esi
000000000001c703	addl	%edi, %esi
000000000001c705	addl	$0xd9d4d039, %esi               ## imm = 0xD9D4D039
000000000001c70b	roll	$0x4, %esi
000000000001c70e	addl	%edx, %esi
000000000001c710	movl	%edx, %edi
000000000001c712	xorl	%ecx, %edi
000000000001c714	xorl	%esi, %edi
000000000001c716	movl	-0x44(%rbp), %r15d
000000000001c71a	addl	%r15d, %eax
000000000001c71d	addl	%edi, %eax
000000000001c71f	addl	$0xe6db99e5, %eax               ## imm = 0xE6DB99E5
000000000001c724	roll	$0xb, %eax
000000000001c727	addl	%esi, %eax
000000000001c729	movl	%esi, %edi
000000000001c72b	xorl	%edx, %edi
000000000001c72d	xorl	%eax, %edi
000000000001c72f	movl	-0x4c(%rbp), %r12d
000000000001c733	addl	%r12d, %ecx
000000000001c736	addl	%edi, %ecx
000000000001c738	addl	$0x1fa27cf8, %ecx               ## imm = 0x1FA27CF8
000000000001c73e	roll	$0x10, %ecx
000000000001c741	addl	%eax, %ecx
000000000001c743	movl	%eax, %edi
000000000001c745	xorl	%esi, %edi
000000000001c747	xorl	%ecx, %edi
000000000001c749	addl	%r13d, %edx
000000000001c74c	addl	%edi, %edx
000000000001c74e	addl	$0xc4ac5665, %edx               ## imm = 0xC4AC5665
000000000001c754	addl	%r8d, %esi
000000000001c757	roll	$0x17, %edx
000000000001c75a	addl	%ecx, %edx
000000000001c75c	movl	%eax, %edi
000000000001c75e	notl	%edi
000000000001c760	orl	%edx, %edi
000000000001c762	xorl	%ecx, %edi
000000000001c764	leal	(%rdi,%rsi), %r14d
000000000001c768	addl	$0xf4292244, %r14d              ## imm = 0xF4292244
000000000001c76f	addl	%r9d, %eax
000000000001c772	roll	$0x6, %r14d
000000000001c776	addl	%edx, %r14d
000000000001c779	movl	%ecx, %esi
000000000001c77b	notl	%esi
000000000001c77d	orl	%r14d, %esi
000000000001c780	xorl	%edx, %esi
000000000001c782	leal	(%rsi,%rax), %r9d
000000000001c786	addl	$0x432aff97, %r9d               ## imm = 0x432AFF97
000000000001c78d	roll	$0xa, %r9d
000000000001c791	addl	-0x30(%rbp), %ecx
000000000001c794	addl	%r14d, %r9d
000000000001c797	movl	%edx, %eax
000000000001c799	notl	%eax
000000000001c79b	orl	%r9d, %eax
000000000001c79e	xorl	%r14d, %eax
000000000001c7a1	addl	%eax, %ecx
000000000001c7a3	addl	$0xab9423a7, %ecx               ## imm = 0xAB9423A7
000000000001c7a9	addl	-0x34(%rbp), %edx
000000000001c7ac	roll	$0xf, %ecx
000000000001c7af	addl	%r9d, %ecx
000000000001c7b2	movl	%r14d, %eax
000000000001c7b5	notl	%eax
000000000001c7b7	orl	%ecx, %eax
000000000001c7b9	xorl	%r9d, %eax
000000000001c7bc	addl	%edx, %eax
000000000001c7be	addl	$0xfc93a039, %eax               ## imm = 0xFC93A039
000000000001c7c3	addl	%r15d, %r14d
000000000001c7c6	roll	$0x15, %eax
000000000001c7c9	addl	%ecx, %eax
000000000001c7cb	movl	%r9d, %edx
000000000001c7ce	notl	%edx
000000000001c7d0	orl	%eax, %edx
000000000001c7d2	xorl	%ecx, %edx
000000000001c7d4	leal	(%rdx,%r14), %r8d
000000000001c7d8	addl	$0x655b59c3, %r8d               ## imm = 0x655B59C3
000000000001c7df	addl	%r11d, %r9d
000000000001c7e2	roll	$0x6, %r8d
000000000001c7e6	addl	%eax, %r8d
000000000001c7e9	movl	%ecx, %edx
000000000001c7eb	notl	%edx
000000000001c7ed	orl	%r8d, %edx
000000000001c7f0	xorl	%eax, %edx
000000000001c7f2	addl	%edx, %r9d
000000000001c7f5	addl	$0x8f0ccc92, %r9d               ## imm = 0x8F0CCC92
000000000001c7fc	roll	$0xa, %r9d
000000000001c800	addl	%r10d, %ecx
000000000001c803	addl	%r8d, %r9d
000000000001c806	movl	%eax, %edx
000000000001c808	notl	%edx
000000000001c80a	orl	%r9d, %edx
000000000001c80d	xorl	%r8d, %edx
000000000001c810	addl	%edx, %ecx
000000000001c812	addl	$0xffeff47d, %ecx               ## imm = 0xFFEFF47D
000000000001c818	addl	-0x60(%rbp), %eax
000000000001c81b	roll	$0xf, %ecx
000000000001c81e	addl	%r9d, %ecx
000000000001c821	movl	%r8d, %edx
000000000001c824	notl	%edx
000000000001c826	orl	%ecx, %edx
000000000001c828	xorl	%r9d, %edx
000000000001c82b	addl	%edx, %eax
000000000001c82d	addl	$0x85845dd1, %eax               ## imm = 0x85845DD1
000000000001c832	addl	-0x3c(%rbp), %r8d
000000000001c836	roll	$0x15, %eax
000000000001c839	addl	%ecx, %eax
000000000001c83b	movl	%r9d, %edx
000000000001c83e	notl	%edx
000000000001c840	orl	%eax, %edx
000000000001c842	xorl	%ecx, %edx
000000000001c844	addl	%edx, %r8d
000000000001c847	addl	$0x6fa87e4f, %r8d               ## imm = 0x6FA87E4F
000000000001c84e	addl	%r12d, %r9d
000000000001c851	roll	$0x6, %r8d
000000000001c855	addl	%eax, %r8d
000000000001c858	movl	%ecx, %edx
000000000001c85a	notl	%edx
000000000001c85c	orl	%r8d, %edx
000000000001c85f	xorl	%eax, %edx
000000000001c861	leal	(%rdx,%r9), %esi
000000000001c865	addl	$0xfe2ce6e0, %esi               ## imm = 0xFE2CE6E0
000000000001c86b	roll	$0xa, %esi
000000000001c86e	addl	%ebx, %ecx
000000000001c870	addl	%r8d, %esi
000000000001c873	movl	%eax, %edx
000000000001c875	notl	%edx
000000000001c877	orl	%esi, %edx
000000000001c879	xorl	%r8d, %edx
000000000001c87c	addl	%edx, %ecx
000000000001c87e	addl	$0xa3014314, %ecx               ## imm = 0xA3014314
000000000001c884	addl	-0x38(%rbp), %eax
000000000001c887	roll	$0xf, %ecx
000000000001c88a	addl	%esi, %ecx
000000000001c88c	movl	%r8d, %edx
000000000001c88f	notl	%edx
000000000001c891	orl	%ecx, %edx
000000000001c893	xorl	%esi, %edx
000000000001c895	addl	%edx, %eax
000000000001c897	addl	$0x4e0811a1, %eax               ## imm = 0x4E0811A1
000000000001c89c	roll	$0x15, %eax
000000000001c89f	addl	%ecx, %eax
000000000001c8a1	addl	-0x40(%rbp), %r8d
000000000001c8a5	movl	%esi, %edx
000000000001c8a7	notl	%edx
000000000001c8a9	orl	%eax, %edx
000000000001c8ab	xorl	%ecx, %edx
000000000001c8ad	addl	%r8d, %edx
000000000001c8b0	addl	$0xf7537e82, %edx               ## imm = 0xF7537E82
000000000001c8b6	roll	$0x6, %edx
000000000001c8b9	addl	%eax, %edx
000000000001c8bb	addl	-0x58(%rbp), %esi
000000000001c8be	movl	%ecx, %edi
000000000001c8c0	notl	%edi
000000000001c8c2	orl	%edx, %edi
000000000001c8c4	xorl	%eax, %edi
000000000001c8c6	addl	%edi, %esi
000000000001c8c8	addl	$0xbd3af235, %esi               ## imm = 0xBD3AF235
000000000001c8ce	roll	$0xa, %esi
000000000001c8d1	addl	%edx, %esi
000000000001c8d3	addl	%r13d, %ecx
000000000001c8d6	movl	%eax, %edi
000000000001c8d8	notl	%edi
000000000001c8da	orl	%esi, %edi
000000000001c8dc	xorl	%edx, %edi
000000000001c8de	addl	%edi, %ecx
000000000001c8e0	addl	$0x2ad7d2bb, %ecx               ## imm = 0x2AD7D2BB
000000000001c8e6	roll	$0xf, %ecx
000000000001c8e9	addl	%esi, %ecx
000000000001c8eb	addl	-0x2c(%rbp), %eax
000000000001c8ee	movl	%edx, %edi
000000000001c8f0	notl	%edi
000000000001c8f2	orl	%ecx, %edi
000000000001c8f4	xorl	%esi, %edi
000000000001c8f6	addl	%edi, %eax
000000000001c8f8	addl	$0xeb86d391, %eax               ## imm = 0xEB86D391
000000000001c8fd	addl	-0xa0(%rbp), %edx
000000000001c903	roll	$0x15, %eax
000000000001c906	movq	-0x88(%rbp), %rdi
000000000001c90d	movl	%edx, (%rdi)
000000000001c90f	movq	-0x80(%rbp), %rdx
000000000001c913	addl	%ecx, %edx
000000000001c915	addl	%eax, %edx
000000000001c917	movl	%edx, 0x4(%rdi)
000000000001c91a	addl	-0x90(%rbp), %ecx
000000000001c920	movl	%ecx, 0x8(%rdi)
000000000001c923	addl	-0x98(%rbp), %esi
000000000001c929	movl	%esi, 0xc(%rdi)
000000000001c92c	popq	%rbx
000000000001c92d	popq	%r12
000000000001c92f	popq	%r13
000000000001c931	popq	%r14
000000000001c933	popq	%r15
000000000001c935	popq	%rbp
000000000001c936	retq
000000000001c937	nop
