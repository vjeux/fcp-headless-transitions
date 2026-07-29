__ZN14HGColorConform26KeyFromColorSpaceTransformEPK16ColorSyncProfileS2_:
00000000001d12a0	pushq	%rbp
00000000001d12a1	movq	%rsp, %rbp
00000000001d12a4	pushq	%rbx
00000000001d12a5	subq	$0x78, %rsp
00000000001d12a9	movq	%rsi, %rbx
00000000001d12ac	movq	0x830fa5(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001d12b3	movq	(%rax), %rax
00000000001d12b6	movq	%rax, -0x10(%rbp)
00000000001d12ba	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001d12bf	movq	%rax, -0x20(%rbp)
00000000001d12c3	movq	%rdx, -0x18(%rbp)
00000000001d12c7	movq	%rbx, %rdi
00000000001d12ca	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001d12cf	movq	%rax, -0x30(%rbp)
00000000001d12d3	movq	%rdx, -0x28(%rbp)
00000000001d12d7	leaq	-0x80(%rbp), %rbx
00000000001d12db	leaq	-0x20(%rbp), %rsi
00000000001d12df	movq	%rbx, %rdi
00000000001d12e2	callq	__ZL22fillBufWithAsciiHexMD5PhS_ ## fillBufWithAsciiHexMD5(unsigned char*, unsigned char*)
00000000001d12e7	leaq	-0x60(%rbp), %rdi
00000000001d12eb	leaq	-0x30(%rbp), %rsi
00000000001d12ef	callq	__ZL22fillBufWithAsciiHexMD5PhS_ ## fillBufWithAsciiHexMD5(unsigned char*, unsigned char*)
00000000001d12f4	movl	$0x40, %edx
00000000001d12f9	xorl	%edi, %edi
00000000001d12fb	movq	%rbx, %rsi
00000000001d12fe	movl	$0x600, %ecx                    ## imm = 0x600
00000000001d1303	xorl	%r8d, %r8d
00000000001d1306	callq	0x3c4b26                        ## symbol stub for: _CFStringCreateWithBytes
00000000001d130b	movq	0x830f46(%rip), %rcx            ## literal pool symbol address: ___stack_chk_guard
00000000001d1312	movq	(%rcx), %rcx
00000000001d1315	cmpq	-0x10(%rbp), %rcx
00000000001d1319	jne	0x1d1322
00000000001d131b	addq	$0x78, %rsp
00000000001d131f	popq	%rbx
00000000001d1320	popq	%rbp
00000000001d1321	retq
00000000001d1322	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000001d1327	nopw	(%rax,%rax)
