__ZNK14PCMatrix44TmplIdEmlERKS0_:
0000000000068210	pushq	%rbp
0000000000068211	movq	%rsp, %rbp
0000000000068214	movq	%rdi, %rax
0000000000068217	movabsq	$0x3ff0000000000000, %rcx       ## imm = 0x3FF0000000000000
0000000000068221	movq	%rcx, 0x78(%rdi)
0000000000068225	movq	%rcx, 0x50(%rdi)
0000000000068229	movq	%rcx, 0x28(%rdi)
000000000006822d	movq	%rcx, (%rdi)
0000000000068230	xorps	%xmm0, %xmm0
0000000000068233	movups	%xmm0, 0x8(%rdi)
0000000000068237	movups	%xmm0, 0x18(%rdi)
000000000006823b	movups	%xmm0, 0x30(%rdi)
000000000006823f	movups	%xmm0, 0x40(%rdi)
0000000000068243	movups	%xmm0, 0x58(%rdi)
0000000000068247	movups	%xmm0, 0x68(%rdi)
000000000006824b	movddup	(%rdx), %xmm0                   ## xmm0 = mem[0,0]
000000000006824f	movapd	%xmm0, -0x80(%rbp)
0000000000068254	movddup	0x20(%rdx), %xmm0               ## xmm0 = mem[0,0]
0000000000068259	movapd	%xmm0, -0x70(%rbp)
000000000006825e	movddup	0x40(%rdx), %xmm0               ## xmm0 = mem[0,0]
0000000000068263	movapd	%xmm0, -0x60(%rbp)
0000000000068268	movddup	0x60(%rdx), %xmm0               ## xmm0 = mem[0,0]
000000000006826d	movapd	%xmm0, -0x50(%rbp)
0000000000068272	movddup	0x8(%rdx), %xmm0                ## xmm0 = mem[0,0]
0000000000068277	movapd	%xmm0, -0x40(%rbp)
000000000006827c	movddup	0x28(%rdx), %xmm0               ## xmm0 = mem[0,0]
0000000000068281	movapd	%xmm0, -0x30(%rbp)
0000000000068286	movddup	0x48(%rdx), %xmm0               ## xmm0 = mem[0,0]
000000000006828b	movapd	%xmm0, -0x20(%rbp)
0000000000068290	movddup	0x68(%rdx), %xmm0               ## xmm0 = mem[0,0]
0000000000068295	movapd	%xmm0, -0x10(%rbp)
000000000006829a	movddup	0x10(%rdx), %xmm8               ## xmm8 = mem[0,0]
00000000000682a0	movddup	0x30(%rdx), %xmm9               ## xmm9 = mem[0,0]
00000000000682a6	movddup	0x50(%rdx), %xmm10              ## xmm10 = mem[0,0]
00000000000682ac	movddup	0x70(%rdx), %xmm11              ## xmm11 = mem[0,0]
00000000000682b2	movddup	0x18(%rdx), %xmm12              ## xmm12 = mem[0,0]
00000000000682b8	movddup	0x38(%rdx), %xmm13              ## xmm13 = mem[0,0]
00000000000682be	movddup	0x58(%rdx), %xmm14              ## xmm14 = mem[0,0]
00000000000682c4	movddup	0x78(%rdx), %xmm15              ## xmm15 = mem[0,0]
00000000000682ca	xorl	%ecx, %ecx
00000000000682cc	movsd	(%rsi,%rcx), %xmm3
00000000000682d1	movsd	0x8(%rsi,%rcx), %xmm7
00000000000682d7	movsd	0x10(%rsi,%rcx), %xmm6
00000000000682dd	movsd	0x18(%rsi,%rcx), %xmm0
00000000000682e3	movhpd	0x20(%rsi,%rcx), %xmm3          ## xmm3 = xmm3[0],mem[0]
00000000000682e9	movhpd	0x28(%rsi,%rcx), %xmm7          ## xmm7 = xmm7[0],mem[0]
00000000000682ef	movhpd	0x30(%rsi,%rcx), %xmm6          ## xmm6 = xmm6[0],mem[0]
00000000000682f5	movhpd	0x38(%rsi,%rcx), %xmm0          ## xmm0 = xmm0[0],mem[0]
00000000000682fb	movapd	%xmm3, %xmm4
00000000000682ff	mulpd	-0x80(%rbp), %xmm4
0000000000068304	movapd	%xmm7, %xmm5
0000000000068308	mulpd	-0x70(%rbp), %xmm5
000000000006830d	addpd	%xmm4, %xmm5
0000000000068311	movapd	%xmm6, %xmm1
0000000000068315	mulpd	-0x60(%rbp), %xmm1
000000000006831a	addpd	%xmm5, %xmm1
000000000006831e	movapd	%xmm0, %xmm4
0000000000068322	mulpd	-0x50(%rbp), %xmm4
0000000000068327	addpd	%xmm1, %xmm4
000000000006832b	movapd	%xmm3, %xmm1
000000000006832f	mulpd	-0x40(%rbp), %xmm1
0000000000068334	movapd	%xmm7, %xmm5
0000000000068338	mulpd	-0x30(%rbp), %xmm5
000000000006833d	addpd	%xmm1, %xmm5
0000000000068341	movapd	%xmm6, %xmm1
0000000000068345	mulpd	-0x20(%rbp), %xmm1
000000000006834a	addpd	%xmm5, %xmm1
000000000006834e	movapd	%xmm0, %xmm5
0000000000068352	mulpd	-0x10(%rbp), %xmm5
0000000000068357	addpd	%xmm1, %xmm5
000000000006835b	movapd	%xmm3, %xmm1
000000000006835f	mulpd	%xmm8, %xmm1
0000000000068364	movapd	%xmm7, %xmm2
0000000000068368	mulpd	%xmm9, %xmm2
000000000006836d	addpd	%xmm1, %xmm2
0000000000068371	movapd	%xmm6, %xmm1
0000000000068375	mulpd	%xmm10, %xmm1
000000000006837a	addpd	%xmm2, %xmm1
000000000006837e	movapd	%xmm0, %xmm2
0000000000068382	mulpd	%xmm11, %xmm2
0000000000068387	addpd	%xmm1, %xmm2
000000000006838b	mulpd	%xmm12, %xmm3
0000000000068390	mulpd	%xmm13, %xmm7
0000000000068395	addpd	%xmm3, %xmm7
0000000000068399	mulpd	%xmm14, %xmm6
000000000006839e	addpd	%xmm7, %xmm6
00000000000683a2	mulpd	%xmm15, %xmm0
00000000000683a7	addpd	%xmm6, %xmm0
00000000000683ab	movapd	%xmm4, %xmm1
00000000000683af	unpcklpd	%xmm5, %xmm1                    ## xmm1 = xmm1[0],xmm5[0]
00000000000683b3	movhlps	%xmm4, %xmm5                    ## xmm5 = xmm4[1],xmm5[1]
00000000000683b6	movapd	%xmm2, %xmm3
00000000000683ba	unpcklpd	%xmm0, %xmm3                    ## xmm3 = xmm3[0],xmm0[0]
00000000000683be	movhlps	%xmm2, %xmm0                    ## xmm0 = xmm2[1],xmm0[1]
00000000000683c1	movups	%xmm0, 0x30(%rax,%rcx)
00000000000683c6	movups	%xmm5, 0x20(%rax,%rcx)
00000000000683cb	movupd	%xmm3, 0x10(%rax,%rcx)
00000000000683d1	movupd	%xmm1, (%rax,%rcx)
00000000000683d6	addq	$0x40, %rcx
00000000000683da	cmpq	$0x80, %rcx
00000000000683e1	jne	0x682cc
00000000000683e7	popq	%rbp
00000000000683e8	retq
00000000000683e9	nop
