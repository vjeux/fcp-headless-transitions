__ZN12HMaskCompAdd6GetDODEP10HGRendereri6HGRect:
0000000000436920	pushq	%rbp
0000000000436921	movq	%rsp, %rbp
0000000000436924	pushq	%r15
0000000000436926	pushq	%r14
0000000000436928	pushq	%r13
000000000043692a	pushq	%r12
000000000043692c	pushq	%rbx
000000000043692d	subq	$0x38, %rsp
0000000000436931	movq	0x3efb00(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000436938	movq	(%rax), %rax
000000000043693b	movq	%rax, -0x30(%rbp)
000000000043693f	testl	%edx, %edx
0000000000436941	je	0x43694f
0000000000436943	movq	0x3ea3d6(%rip), %rcx            ## literal pool symbol address: _HGRectNull
000000000043694a	jmp	0x436ae5
000000000043694f	movq	%rsi, %r12
0000000000436952	movq	%rdi, %r15
0000000000436955	movl	$0x0, -0x58(%rbp)
000000000043695c	movq	%rsi, %rdi
000000000043695f	movq	%r15, %rsi
0000000000436962	xorl	%edx, %edx
0000000000436964	callq	0x6dd37a                        ## symbol stub for: __ZN10HGRenderer8GetInputEP6HGNodei
0000000000436969	movq	%r12, %rdi
000000000043696c	movq	%rax, %rsi
000000000043696f	callq	0x6dd36e                        ## symbol stub for: __ZN10HGRenderer6GetDODEP6HGNode
0000000000436974	movq	%rax, %rbx
0000000000436977	movq	%rdx, %r13
000000000043697a	movq	%rax, %rdi
000000000043697d	movq	%rdx, %rsi
0000000000436980	callq	0x6dcc9c                        ## symbol stub for: _HGRectIsNull
0000000000436985	movl	$0xffffffff, -0x54(%rbp)        ## imm = 0xFFFFFFFF
000000000043698c	movl	$0x0, %edx
0000000000436991	movl	$0x0, %ecx
0000000000436996	movl	$0xffffffff, -0x44(%rbp)        ## imm = 0xFFFFFFFF
000000000043699d	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000004369a2	testl	%eax, %eax
00000000004369a4	jne	0x4369f1
00000000004369a6	cmpl	$0xc0000002, %ebx               ## imm = 0xC0000002
00000000004369ac	movl	$0xc0000001, %ecx               ## imm = 0xC0000001
00000000004369b1	movl	$0xc0000001, %edx               ## imm = 0xC0000001
00000000004369b6	cmovgel	%ebx, %edx
00000000004369b9	shrq	$0x20, %rbx
00000000004369bd	cmpl	$0xc0000002, %ebx               ## imm = 0xC0000002
00000000004369c3	cmovgel	%ebx, %ecx
00000000004369c6	cmpl	$0x3ffffffe, %r13d              ## imm = 0x3FFFFFFE
00000000004369cd	movl	$0x3ffffffe, %esi               ## imm = 0x3FFFFFFE
00000000004369d2	movl	$0x3ffffffe, %eax               ## imm = 0x3FFFFFFE
00000000004369d7	cmovll	%r13d, %eax
00000000004369db	shrq	$0x20, %r13
00000000004369df	cmpl	$0x3ffffffe, %r13d              ## imm = 0x3FFFFFFE
00000000004369e6	cmovll	%r13d, %esi
00000000004369ea	subl	%edx, %eax
00000000004369ec	movl	%eax, -0x44(%rbp)
00000000004369ef	subl	%ecx, %esi
00000000004369f1	movl	%esi, -0x48(%rbp)
00000000004369f4	movl	%edx, -0x4c(%rbp)
00000000004369f7	movl	%ecx, -0x50(%rbp)
00000000004369fa	movq	%r12, %rdi
00000000004369fd	movq	%r15, %rsi
0000000000436a00	movl	$0x1, %edx
0000000000436a05	callq	0x6dd37a                        ## symbol stub for: __ZN10HGRenderer8GetInputEP6HGNodei
0000000000436a0a	movq	%r12, %rdi
0000000000436a0d	movq	%rax, %rsi
0000000000436a10	callq	0x6dd36e                        ## symbol stub for: __ZN10HGRenderer6GetDODEP6HGNode
0000000000436a15	movq	%rax, %r14
0000000000436a18	movq	%rdx, %rbx
0000000000436a1b	movq	%rax, %rdi
0000000000436a1e	movq	%rdx, %rsi
0000000000436a21	callq	0x6dcc9c                        ## symbol stub for: _HGRectIsNull
0000000000436a26	movl	$0x0, %r13d
0000000000436a2c	movl	$0xffffffff, %r12d              ## imm = 0xFFFFFFFF
0000000000436a32	testl	%eax, %eax
0000000000436a34	jne	0x436a89
0000000000436a36	cmpl	$0xc0000002, %r14d              ## imm = 0xC0000002
0000000000436a3d	movl	$0xc0000001, %eax               ## imm = 0xC0000001
0000000000436a42	movl	$0xc0000001, %r13d              ## imm = 0xC0000001
0000000000436a48	cmovgel	%r14d, %r13d
0000000000436a4c	shrq	$0x20, %r14
0000000000436a50	cmpl	$0xc0000002, %r14d              ## imm = 0xC0000002
0000000000436a57	cmovgel	%r14d, %eax
0000000000436a5b	cmpl	$0x3ffffffe, %ebx               ## imm = 0x3FFFFFFE
0000000000436a61	movl	$0x3ffffffe, %r12d              ## imm = 0x3FFFFFFE
0000000000436a67	movl	$0x3ffffffe, %ecx               ## imm = 0x3FFFFFFE
0000000000436a6c	cmovll	%ebx, %ecx
0000000000436a6f	shrq	$0x20, %rbx
0000000000436a73	cmpl	$0x3ffffffe, %ebx               ## imm = 0x3FFFFFFE
0000000000436a79	cmovll	%ebx, %r12d
0000000000436a7d	subl	%r13d, %ecx
0000000000436a80	movl	%ecx, -0x54(%rbp)
0000000000436a83	movl	%eax, -0x58(%rbp)
0000000000436a86	subl	%eax, %r12d
0000000000436a89	movq	(%r15), %rax
0000000000436a8c	leaq	-0x40(%rbp), %rdx
0000000000436a90	movq	%r15, %rdi
0000000000436a93	movl	$0x1, %esi
0000000000436a98	callq	*0x68(%rax)
0000000000436a9b	movss	-0x40(%rbp), %xmm1
0000000000436aa0	andps	0x2d1119(%rip), %xmm1
0000000000436aa7	movss	0x2d1131(%rip), %xmm0
0000000000436aaf	ucomiss	%xmm1, %xmm0
0000000000436ab2	jbe	0x436ade
0000000000436ab4	movss	-0x3c(%rbp), %xmm1
0000000000436ab9	andps	0x2d1100(%rip), %xmm1
0000000000436ac0	ucomiss	%xmm1, %xmm0
0000000000436ac3	jbe	0x436b0f
0000000000436ac5	movl	-0x58(%rbp), %esi
0000000000436ac8	movl	-0x54(%rbp), %edx
0000000000436acb	addl	%r13d, %edx
0000000000436ace	addl	%esi, %r12d
0000000000436ad1	movl	%r13d, %edi
0000000000436ad4	movl	%r12d, %ecx
0000000000436ad7	callq	0x6dcca8                        ## symbol stub for: _HGRectMake4i
0000000000436adc	jmp	0x436aec
0000000000436ade	movq	0x3ea20b(%rip), %rcx            ## literal pool symbol address: _HGRectInfinite
0000000000436ae5	movq	(%rcx), %rax
0000000000436ae8	movq	0x8(%rcx), %rdx
0000000000436aec	movq	0x3ef945(%rip), %rcx            ## literal pool symbol address: ___stack_chk_guard
0000000000436af3	movq	(%rcx), %rcx
0000000000436af6	cmpq	-0x30(%rbp), %rcx
0000000000436afa	jne	0x436b80
0000000000436b00	addq	$0x38, %rsp
0000000000436b04	popq	%rbx
0000000000436b05	popq	%r12
0000000000436b07	popq	%r13
0000000000436b09	popq	%r14
0000000000436b0b	popq	%r15
0000000000436b0d	popq	%rbp
0000000000436b0e	retq
0000000000436b0f	cmpl	$0x0, -0x44(%rbp)
0000000000436b13	movl	-0x58(%rbp), %esi
0000000000436b16	movl	-0x54(%rbp), %edx
0000000000436b19	js	0x436acb
0000000000436b1b	cmpl	$0x0, -0x48(%rbp)
0000000000436b1f	js	0x436acb
0000000000436b21	testl	%edx, %edx
0000000000436b23	js	0x436b6d
0000000000436b25	testl	%r12d, %r12d
0000000000436b28	js	0x436b6d
0000000000436b2a	movl	-0x4c(%rbp), %ecx
0000000000436b2d	cmpl	%r13d, %ecx
0000000000436b30	movl	%r13d, %eax
0000000000436b33	cmovll	%ecx, %eax
0000000000436b36	movl	-0x44(%rbp), %edi
0000000000436b39	addl	%ecx, %edi
0000000000436b3b	addl	%r13d, %edx
0000000000436b3e	cmpl	%edx, %edi
0000000000436b40	cmovgl	%edi, %edx
0000000000436b43	movl	-0x50(%rbp), %edi
0000000000436b46	cmpl	%esi, %edi
0000000000436b48	movl	%esi, %ecx
0000000000436b4a	cmovll	%edi, %ecx
0000000000436b4d	movl	-0x48(%rbp), %r8d
0000000000436b51	addl	%edi, %r8d
0000000000436b54	addl	%esi, %r12d
0000000000436b57	cmpl	%r12d, %r8d
0000000000436b5a	cmovgl	%r8d, %r12d
0000000000436b5e	subl	%eax, %edx
0000000000436b60	subl	%ecx, %r12d
0000000000436b63	movl	%ecx, %esi
0000000000436b65	movl	%eax, %r13d
0000000000436b68	jmp	0x436acb
0000000000436b6d	movl	-0x48(%rbp), %r12d
0000000000436b71	movl	-0x44(%rbp), %edx
0000000000436b74	movl	-0x50(%rbp), %esi
0000000000436b77	movl	-0x4c(%rbp), %r13d
0000000000436b7b	jmp	0x436acb
0000000000436b80	callq	0x6dfd38                        ## symbol stub for: ___stack_chk_fail
0000000000436b85	movq	%rax, %rdi
0000000000436b88	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000436b8d	nopl	(%rax)
