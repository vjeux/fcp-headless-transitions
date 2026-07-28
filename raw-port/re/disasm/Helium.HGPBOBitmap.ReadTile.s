__ZN11HGPBOBitmap8ReadTileEPv6HGRecti:
00000000000a13c0	pushq	%rbp
00000000000a13c1	movq	%rsp, %rbp
00000000000a13c4	pushq	%r15
00000000000a13c6	pushq	%r14
00000000000a13c8	pushq	%r13
00000000000a13ca	pushq	%r12
00000000000a13cc	pushq	%rbx
00000000000a13cd	pushq	%rax
00000000000a13ce	movl	%r8d, %ebx
00000000000a13d1	movq	%rcx, %r14
00000000000a13d4	movq	%rdx, %r15
00000000000a13d7	movq	%rsi, %r12
00000000000a13da	movq	%rdi, %r13
00000000000a13dd	movq	0x80(%rdi), %rdi
00000000000a13e4	callq	__ZN16HGPixelBufferObj10GetDataPtrEv ## HGPixelBufferObj::GetDataPtr()
00000000000a13e9	testq	%rax, %rax
00000000000a13ec	je	0xa1410
00000000000a13ee	movq	%r13, %rdi
00000000000a13f1	movq	%r12, %rsi
00000000000a13f4	movq	%r15, %rdx
00000000000a13f7	movq	%r14, %rcx
00000000000a13fa	movl	%ebx, %r8d
00000000000a13fd	addq	$0x8, %rsp
00000000000a1401	popq	%rbx
00000000000a1402	popq	%r12
00000000000a1404	popq	%r13
00000000000a1406	popq	%r14
00000000000a1408	popq	%r15
00000000000a140a	popq	%rbp
00000000000a140b	jmp	__ZN8HGBitmap8ReadTileEPv6HGRecti ## HGBitmap::ReadTile(void*, HGRect, int)
00000000000a1410	leaq	0x83aad7(%rip), %rdi            ## literal pool for: "reading tile from unmapped PBO"
00000000000a1417	xorl	%eax, %eax
00000000000a1419	addq	$0x8, %rsp
00000000000a141d	popq	%rbx
00000000000a141e	popq	%r12
00000000000a1420	popq	%r13
00000000000a1422	popq	%r14
00000000000a1424	popq	%r15
00000000000a1426	popq	%rbp
00000000000a1427	jmp	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
00000000000a142c	nopl	(%rax)
