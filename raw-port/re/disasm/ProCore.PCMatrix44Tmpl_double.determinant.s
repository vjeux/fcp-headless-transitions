__ZNK14PCMatrix44TmplIdE11determinantEv:
00000000000514bc	pushq	%rbp
00000000000514bd	movq	%rsp, %rbp
00000000000514c0	movupd	0x40(%rdi), %xmm1
00000000000514c5	movupd	0x60(%rdi), %xmm0
00000000000514ca	shufpd	$0x1, %xmm0, %xmm0              ## xmm0 = xmm0[1,0]
00000000000514cf	mulpd	%xmm1, %xmm0
00000000000514d3	movupd	0x70(%rdi), %xmm5
00000000000514d8	movupd	0x50(%rdi), %xmm4
00000000000514dd	movddup	0x48(%rdi), %xmm2               ## xmm2 = mem[0,0]
00000000000514e2	mulpd	%xmm5, %xmm2
00000000000514e6	movddup	0x40(%rdi), %xmm1               ## xmm1 = mem[0,0]
00000000000514eb	mulpd	%xmm5, %xmm1
00000000000514ef	shufpd	$0x1, %xmm5, %xmm5              ## xmm5 = xmm5[1,0]
00000000000514f4	mulpd	%xmm4, %xmm5
00000000000514f8	movddup	0x68(%rdi), %xmm3               ## xmm3 = mem[0,0]
00000000000514fd	mulpd	%xmm4, %xmm3
0000000000051501	subpd	%xmm3, %xmm2
0000000000051505	movddup	0x60(%rdi), %xmm3               ## xmm3 = mem[0,0]
000000000005150a	mulpd	%xmm4, %xmm3
000000000005150e	subpd	%xmm3, %xmm1
0000000000051512	movupd	(%rdi), %xmm3
0000000000051516	hsubpd	%xmm0, %xmm0
000000000005151a	movupd	0x20(%rdi), %xmm4
000000000005151f	hsubpd	%xmm5, %xmm5
0000000000051523	movupd	0x30(%rdi), %xmm6
0000000000051528	mulpd	%xmm6, %xmm0
000000000005152c	shufpd	$0x1, %xmm4, %xmm4              ## xmm4 = xmm4[1,0]
0000000000051531	mulpd	%xmm5, %xmm4
0000000000051535	movddup	0x30(%rdi), %xmm5               ## xmm5 = mem[0,0]
000000000005153a	movapd	%xmm2, %xmm6
000000000005153e	movddup	0x20(%rdi), %xmm7               ## xmm7 = mem[0,0]
0000000000051543	mulpd	%xmm2, %xmm7
0000000000051547	unpckhpd	%xmm1, %xmm2                    ## xmm2 = xmm2[1],xmm1[1]
000000000005154b	mulpd	%xmm5, %xmm2
000000000005154f	movupd	0x10(%rdi), %xmm5
0000000000051554	subpd	%xmm2, %xmm4
0000000000051558	unpcklpd	%xmm1, %xmm6                    ## xmm6 = xmm6[0],xmm1[0]
000000000005155c	movddup	0x38(%rdi), %xmm2               ## xmm2 = mem[0,0]
0000000000051561	mulpd	%xmm6, %xmm2
0000000000051565	addpd	%xmm4, %xmm2
0000000000051569	mulpd	%xmm3, %xmm2
000000000005156d	movddup	0x28(%rdi), %xmm3               ## xmm3 = mem[0,0]
0000000000051572	mulpd	%xmm1, %xmm3
0000000000051576	subpd	%xmm3, %xmm7
000000000005157a	addpd	%xmm0, %xmm7
000000000005157e	shufpd	$0x1, %xmm5, %xmm5              ## xmm5 = xmm5[1,0]
0000000000051583	mulpd	%xmm7, %xmm5
0000000000051587	hsubpd	%xmm2, %xmm2
000000000005158b	movapd	%xmm5, %xmm0
000000000005158f	unpckhpd	%xmm5, %xmm0                    ## xmm0 = xmm0[1],xmm5[1]
0000000000051593	addsd	%xmm2, %xmm0
0000000000051597	subsd	%xmm5, %xmm0
000000000005159b	popq	%rbp
000000000005159c	retq
000000000005159d	nop
