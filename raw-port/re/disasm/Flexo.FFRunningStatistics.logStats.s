__ZN19FFRunningStatistics8logStatsEPKc:
00000000012ed2a0	pushq	%rbp
00000000012ed2a1	movq	%rsp, %rbp
00000000012ed2a4	movq	%rsi, %rcx
00000000012ed2a7	movq	%rdi, %rax
00000000012ed2aa	movq	(%rdi), %rdx
00000000012ed2ad	movq	0x60091c(%rip), %rsi            ## literal pool symbol address: ___stderrp
00000000012ed2b4	movq	(%rsi), %rdi
00000000012ed2b7	testq	%rdx, %rdx
00000000012ed2ba	je	0x12ed31e
00000000012ed2bc	movsd	0x18(%rax), %xmm0
00000000012ed2c1	xorpd	%xmm1, %xmm1
00000000012ed2c5	cmpq	$0x1, %rdx
00000000012ed2c9	je	0x12ed300
00000000012ed2cb	leaq	-0x1(%rdx), %rsi
00000000012ed2cf	movq	%rsi, %xmm1
00000000012ed2d4	punpckldq	0x27f804(%rip), %xmm1   ## xmm1 = xmm1[0],mem[0],xmm1[1],mem[1]
00000000012ed2dc	movsd	0x20(%rax), %xmm2
00000000012ed2e1	subpd	0x27f807(%rip), %xmm1
00000000012ed2e9	movapd	%xmm1, %xmm3
00000000012ed2ed	unpckhpd	%xmm1, %xmm3                    ## xmm3 = xmm3[1],xmm1[1]
00000000012ed2f1	addsd	%xmm1, %xmm3
00000000012ed2f5	divsd	%xmm3, %xmm2
00000000012ed2f9	xorps	%xmm1, %xmm1
00000000012ed2fc	sqrtsd	%xmm2, %xmm1
00000000012ed300	movsd	0x8(%rax), %xmm2
00000000012ed305	movsd	0x10(%rax), %xmm3
00000000012ed30a	movsd	0x28(%rax), %xmm4
00000000012ed30f	leaq	0x39fa3c(%rip), %rsi            ## literal pool for: "[%llu] %s - avg:%g, var:%g, min:%g, max:%g, last time:%g\n"
00000000012ed316	movb	$0x5, %al
00000000012ed318	popq	%rbp
00000000012ed319	jmp	0x1497758                       ## symbol stub for: _fprintf
00000000012ed31e	leaq	0x39fa67(%rip), %rsi            ## literal pool for: "%s - No data\n"
00000000012ed325	movq	%rcx, %rdx
00000000012ed328	xorl	%eax, %eax
00000000012ed32a	popq	%rbp
00000000012ed32b	jmp	0x1497758                       ## symbol stub for: _fprintf
