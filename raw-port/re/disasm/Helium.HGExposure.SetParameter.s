__ZN10HGExposure12SetParameterEiffff:
00000000001a9030	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000001a9035	testl	%esi, %esi
00000000001a9037	je	0x1a903a
00000000001a9039	retq
00000000001a903a	pushq	%rbp
00000000001a903b	movq	%rsp, %rbp
00000000001a903e	pushq	%rbx
00000000001a903f	subq	$0x28, %rsp
00000000001a9043	movq	%rdi, %rbx
00000000001a9046	movss	%xmm2, -0xc(%rbp)
00000000001a904b	movss	%xmm1, -0x20(%rbp)
00000000001a9050	callq	0x3c50f6                        ## symbol stub for: _exp2f
00000000001a9055	movaps	%xmm0, -0x30(%rbp)
00000000001a9059	movss	-0x20(%rbp), %xmm0
00000000001a905e	callq	0x3c50f6                        ## symbol stub for: _exp2f
00000000001a9063	movaps	%xmm0, -0x20(%rbp)
00000000001a9067	movss	-0xc(%rbp), %xmm0
00000000001a906c	callq	0x3c50f6                        ## symbol stub for: _exp2f
00000000001a9071	movaps	-0x20(%rbp), %xmm3
00000000001a9075	movaps	-0x30(%rbp), %xmm2
00000000001a9079	movaps	%xmm2, %xmm1
00000000001a907c	insertps	$0x10, %xmm3, %xmm1             ## xmm1 = xmm1[0],xmm3[0],xmm1[2,3]
00000000001a9082	insertps	$0x20, %xmm0, %xmm1             ## xmm1 = xmm1[0,1],xmm0[0],xmm1[3]
00000000001a9088	insertps	$0x30, 0x21ec2e(%rip), %xmm1    ## xmm1 = xmm1[0,1,2],mem[0]
00000000001a9092	cmpneqps	0x200(%rbx), %xmm1
00000000001a909a	movmskps	%xmm1, %eax
00000000001a909d	testl	%eax, %eax
00000000001a909f	je	0x1a90ca
00000000001a90a1	insertps	$0x10, %xmm3, %xmm2             ## xmm2 = xmm2[0],xmm3[0],xmm2[2,3]
00000000001a90a7	insertps	$0x20, %xmm0, %xmm2             ## xmm2 = xmm2[0,1],xmm0[0],xmm2[3]
00000000001a90ad	insertps	$0x30, 0x21ec09(%rip), %xmm2    ## xmm2 = xmm2[0,1,2],mem[0]
00000000001a90b7	movaps	%xmm2, 0x200(%rbx)
00000000001a90be	movl	$0x1, %eax
00000000001a90c3	addq	$0x28, %rsp
00000000001a90c7	popq	%rbx
00000000001a90c8	popq	%rbp
00000000001a90c9	retq
00000000001a90ca	xorl	%eax, %eax
00000000001a90cc	addq	$0x28, %rsp
00000000001a90d0	popq	%rbx
00000000001a90d1	popq	%rbp
00000000001a90d2	retq
00000000001a90d3	nopw	%cs:(%rax,%rax)
