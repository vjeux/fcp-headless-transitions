__ZN11HGTransform11LoadFrustumEffffff:
00000000001b4810	pushq	%rbp
00000000001b4811	movq	%rsp, %rbp
00000000001b4814	pushq	%rbx
00000000001b4815	subq	$0x58, %rsp
00000000001b4819	movss	%xmm5, -0xc(%rbp)
00000000001b481e	movaps	%xmm4, -0x30(%rbp)
00000000001b4822	movaps	%xmm3, -0x50(%rbp)
00000000001b4826	movaps	%xmm2, -0x60(%rbp)
00000000001b482a	movaps	%xmm1, -0x20(%rbp)
00000000001b482e	movaps	%xmm0, -0x40(%rbp)
00000000001b4832	movq	%rdi, %rbx
00000000001b4835	movq	(%rdi), %rax
00000000001b4838	callq	*0x38(%rax)
00000000001b483b	movaps	-0x30(%rbp), %xmm5
00000000001b483f	movaps	%xmm5, %xmm0
00000000001b4842	addss	%xmm5, %xmm0
00000000001b4846	movaps	-0x20(%rbp), %xmm2
00000000001b484a	insertps	$0x10, -0x50(%rbp), %xmm2       ## xmm2 = xmm2[0],mem[0],xmm2[2,3]
00000000001b4851	movaps	-0x40(%rbp), %xmm3
00000000001b4855	insertps	$0x10, -0x60(%rbp), %xmm3       ## xmm3 = xmm3[0],mem[0],xmm3[2,3]
00000000001b485c	movaps	%xmm2, %xmm1
00000000001b485f	movaps	%xmm2, %xmm4
00000000001b4862	subps	%xmm3, %xmm1
00000000001b4865	movaps	%xmm0, %xmm2
00000000001b4868	divss	%xmm1, %xmm2
00000000001b486c	cvtss2sd	%xmm2, %xmm2
00000000001b4870	movsd	%xmm2, 0x10(%rbx)
00000000001b4875	addps	%xmm4, %xmm3
00000000001b4878	movshdup	%xmm1, %xmm2                    ## xmm2 = xmm1[1,1,3,3]
00000000001b487c	divss	%xmm2, %xmm0
00000000001b4880	cvtss2sd	%xmm0, %xmm0
00000000001b4884	movsd	%xmm0, 0x38(%rbx)
00000000001b4889	divps	%xmm1, %xmm3
00000000001b488c	cvtps2pd	%xmm3, %xmm0
00000000001b488f	movups	%xmm0, 0x50(%rbx)
00000000001b4893	movq	$0x0, 0x78(%rbx)
00000000001b489b	xorps	%xmm0, %xmm0
00000000001b489e	movups	%xmm0, 0x18(%rbx)
00000000001b48a2	movaps	%xmm5, %xmm1
00000000001b48a5	movss	-0xc(%rbp), %xmm4
00000000001b48aa	addss	%xmm4, %xmm1
00000000001b48ae	movaps	0x21581b(%rip), %xmm2
00000000001b48b5	xorps	%xmm2, %xmm1
00000000001b48b8	movaps	%xmm4, %xmm3
00000000001b48bb	subss	%xmm5, %xmm3
00000000001b48bf	divss	%xmm3, %xmm1
00000000001b48c3	cvtss2sd	%xmm1, %xmm1
00000000001b48c7	movsd	%xmm1, 0x60(%rbx)
00000000001b48cc	addss	%xmm4, %xmm4
00000000001b48d0	movaps	%xmm5, %xmm1
00000000001b48d3	xorps	%xmm2, %xmm1
00000000001b48d6	mulss	%xmm4, %xmm1
00000000001b48da	divss	%xmm3, %xmm1
00000000001b48de	cvtss2sd	%xmm1, %xmm1
00000000001b48e2	movsd	%xmm1, 0x80(%rbx)
00000000001b48ea	movups	%xmm0, 0x28(%rbx)
00000000001b48ee	movups	%xmm0, 0x40(%rbx)
00000000001b48f2	movsd	0x215a06(%rip), %xmm0
00000000001b48fa	movups	%xmm0, 0x68(%rbx)
00000000001b48fe	movq	$0x0, 0x88(%rbx)
00000000001b4909	addq	$0x58, %rsp
00000000001b490d	popq	%rbx
00000000001b490e	popq	%rbp
00000000001b490f	retq
