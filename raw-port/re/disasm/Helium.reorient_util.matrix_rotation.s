__ZN13reorient_util15matrix_rotationEffff:
00000000000038e0	pushq	%rbp
00000000000038e1	movq	%rsp, %rbp
00000000000038e4	pushq	%rbx
00000000000038e5	subq	$0x18, %rsp
00000000000038e9	movaps	%xmm0, %xmm4
00000000000038ec	insertps	$0x10, %xmm2, %xmm1             ## xmm1 = xmm1[0],xmm2[0],xmm1[2,3]
00000000000038f2	insertps	$0x20, %xmm3, %xmm1             ## xmm1 = xmm1[0,1],xmm3[0],xmm1[3]
00000000000038f8	movaps	%xmm1, %xmm2
00000000000038fb	mulps	%xmm1, %xmm2
00000000000038fe	movshdup	%xmm2, %xmm0                    ## xmm0 = xmm2[1,1,3,3]
0000000000003902	addps	%xmm2, %xmm0
0000000000003905	movhlps	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
0000000000003908	addps	%xmm0, %xmm2
000000000000390b	movaps	%xmm2, %xmm3
000000000000390e	rsqrtss	%xmm2, %xmm3
0000000000003912	mulss	0x3c43ae(%rip), %xmm2
000000000000391a	movss	0x3c669e(%rip), %xmm0
0000000000003922	cmpless	%xmm3, %xmm0
0000000000003927	blendvps	%xmm0, 0x3c66a0(%rip), %xmm2
0000000000003930	movq	%rdi, %rbx
0000000000003933	mulss	%xmm3, %xmm2
0000000000003937	mulss	%xmm3, %xmm2
000000000000393b	movss	0x3c438d(%rip), %xmm0
0000000000003943	subss	%xmm2, %xmm0
0000000000003947	mulss	%xmm3, %xmm0
000000000000394b	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
000000000000394f	mulps	%xmm1, %xmm0
0000000000003952	movaps	%xmm0, -0x20(%rbp)
0000000000003956	movaps	%xmm4, %xmm0
0000000000003959	callq	0x3c502a                        ## symbol stub for: ___sincosf_stret
000000000000395e	movshdup	%xmm0, %xmm6                    ## xmm6 = xmm0[1,1,3,3]
0000000000003962	movss	0x3c4356(%rip), %xmm1
000000000000396a	subss	%xmm6, %xmm1
000000000000396e	movaps	%xmm1, %xmm2
0000000000003971	movaps	-0x20(%rbp), %xmm10
0000000000003976	mulss	%xmm10, %xmm2
000000000000397b	movshdup	%xmm10, %xmm4                   ## xmm4 = xmm10[1,1,3,3]
0000000000003980	movaps	%xmm10, %xmm3
0000000000003984	unpckhpd	%xmm10, %xmm3                   ## xmm3 = xmm3[1],xmm10[1]
0000000000003989	movsldup	%xmm2, %xmm7                    ## xmm7 = xmm2[0,0,2,2]
000000000000398d	mulps	%xmm10, %xmm7
0000000000003991	movaps	%xmm0, %xmm5
0000000000003994	mulss	%xmm0, %xmm10
0000000000003999	movaps	%xmm0, %xmm8
000000000000399d	mulss	%xmm3, %xmm8
00000000000039a2	mulss	%xmm4, %xmm5
00000000000039a6	movaps	%xmm1, %xmm0
00000000000039a9	mulss	%xmm4, %xmm0
00000000000039ad	mulss	%xmm0, %xmm4
00000000000039b1	addss	%xmm6, %xmm4
00000000000039b5	mulss	%xmm3, %xmm1
00000000000039b9	mulss	%xmm3, %xmm1
00000000000039bd	addss	%xmm6, %xmm1
00000000000039c1	insertps	$0x1c, %xmm8, %xmm6             ## xmm6 = xmm6[0],xmm8[0],zero,zero
00000000000039c8	addps	%xmm7, %xmm6
00000000000039cb	mulss	%xmm3, %xmm2
00000000000039cf	movaps	%xmm2, %xmm9
00000000000039d3	subss	%xmm5, %xmm9
00000000000039d8	insertps	$0x28, %xmm9, %xmm6             ## xmm6 = xmm6[0,1],xmm9[0],zero
00000000000039df	movaps	%xmm6, (%rbx)
00000000000039e2	movshdup	%xmm7, %xmm6                    ## xmm6 = xmm7[1,1,3,3]
00000000000039e6	subss	%xmm8, %xmm6
00000000000039eb	insertps	$0x1c, %xmm4, %xmm6             ## xmm6 = xmm6[0],xmm4[0],zero,zero
00000000000039f1	mulss	%xmm3, %xmm0
00000000000039f5	movaps	%xmm10, %xmm3
00000000000039f9	addss	%xmm0, %xmm3
00000000000039fd	insertps	$0x28, %xmm3, %xmm6             ## xmm6 = xmm6[0,1],xmm3[0],zero
0000000000003a03	movaps	%xmm6, 0x10(%rbx)
0000000000003a07	addss	%xmm2, %xmm5
0000000000003a0b	subss	%xmm10, %xmm0
0000000000003a10	insertps	$0x1c, %xmm0, %xmm5             ## xmm5 = xmm5[0],xmm0[0],zero,zero
0000000000003a16	insertps	$0x28, %xmm1, %xmm5             ## xmm5 = xmm5[0,1],xmm1[0],zero
0000000000003a1c	movaps	%xmm5, 0x20(%rbx)
0000000000003a20	movaps	0x3c65b9(%rip), %xmm0
0000000000003a27	movaps	%xmm0, 0x30(%rbx)
0000000000003a2b	movq	%rbx, %rax
0000000000003a2e	addq	$0x18, %rsp
0000000000003a32	popq	%rbx
0000000000003a33	popq	%rbp
0000000000003a34	retq
0000000000003a35	nopw	%cs:(%rax,%rax)
