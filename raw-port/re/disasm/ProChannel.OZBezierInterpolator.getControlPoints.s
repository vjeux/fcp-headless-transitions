
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

000000000004054a <__ZN20OZBezierInterpolator16getControlPointsER8OZSplinePvS2_RK6CMTimeRS3_S6_PdS7_>:
   4054a: 55                           	pushq	%rbp
   4054b: 48 89 e5                     	movq	%rsp, %rbp
   4054e: 41 57                        	pushq	%r15
   40550: 41 56                        	pushq	%r14
   40552: 41 55                        	pushq	%r13
   40554: 41 54                        	pushq	%r12
   40556: 53                           	pushq	%rbx
   40557: 48 81 ec 98 00 00 00         	subq	$0x98, %rsp
   4055e: 4d 89 c6                     	movq	%r8, %r14
   40561: 49 89 f4                     	movq	%rsi, %r12
   40564: 48 89 7d 88                  	movq	%rdi, -0x78(%rbp)
   40568: 4c 8b 7d 20                  	movq	0x20(%rbp), %r15
   4056c: 48 8b 75 10                  	movq	0x10(%rbp), %rsi
   40570: 0f 10 42 10                  	movups	0x10(%rdx), %xmm0
   40574: 49 89 d5                     	movq	%rdx, %r13
   40577: 48 8b 42 20                  	movq	0x20(%rdx), %rax
   4057b: 49 89 41 10                  	movq	%rax, 0x10(%r9)
   4057f: 41 0f 11 01                  	movups	%xmm0, (%r9)
   40583: 0f 10 41 10                  	movups	0x10(%rcx), %xmm0
   40587: 48 89 cb                     	movq	%rcx, %rbx
   4058a: 48 8b 41 20                  	movq	0x20(%rcx), %rax
   4058e: 48 89 46 10                  	movq	%rax, 0x10(%rsi)
   40592: 0f 11 06                     	movups	%xmm0, (%rsi)
   40595: 49 8b 41 10                  	movq	0x10(%r9), %rax
   40599: 48 89 45 d0                  	movq	%rax, -0x30(%rbp)
   4059d: 4c 89 4d 98                  	movq	%r9, -0x68(%rbp)
   405a1: 41 0f 10 01                  	movups	(%r9), %xmm0
   405a5: 0f 29 45 c0                  	movaps	%xmm0, -0x40(%rbp)
   405a9: 48 8b 46 10                  	movq	0x10(%rsi), %rax
   405ad: 48 89 45 b0                  	movq	%rax, -0x50(%rbp)
   405b1: 0f 10 06                     	movups	(%rsi), %xmm0
   405b4: 0f 29 45 a0                  	movaps	%xmm0, -0x60(%rbp)
   405b8: 48 8b 45 b0                  	movq	-0x50(%rbp), %rax
   405bc: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   405c1: 0f 28 45 a0                  	movaps	-0x60(%rbp), %xmm0
   405c5: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   405ca: 48 8b 45 d0                  	movq	-0x30(%rbp), %rax
   405ce: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   405d3: 0f 28 45 c0                  	movaps	-0x40(%rbp), %xmm0
   405d7: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   405db: e8 a0 c4 06 00               	callq	0xaca80 <_tan+0xaca80>
   405e0: 85 c0                        	testl	%eax, %eax
   405e2: 7e 6b                        	jle	0x4064f <__ZN20OZBezierInterpolator16getControlPointsER8OZSplinePvS2_RK6CMTimeRS3_S6_PdS7_+0x105>
   405e4: 4c 8d bd 70 ff ff ff         	leaq	-0x90(%rbp), %r15
   405eb: 4c 89 ff                     	movq	%r15, %rdi
   405ee: 4c 89 e6                     	movq	%r12, %rsi
   405f1: e8 5c f8 fe ff               	callq	0x2fe52 <__ZNK8OZSpline14getSmallDeltaUEv>
   405f6: 48 8b 4d 98                  	movq	-0x68(%rbp), %rcx
   405fa: 48 8b 41 10                  	movq	0x10(%rcx), %rax
   405fe: 48 89 45 d0                  	movq	%rax, -0x30(%rbp)
   40602: 0f 10 01                     	movups	(%rcx), %xmm0
   40605: 0f 29 45 c0                  	movaps	%xmm0, -0x40(%rbp)
   40609: 49 8b 47 10                  	movq	0x10(%r15), %rax
   4060d: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   40612: 41 0f 10 07                  	movups	(%r15), %xmm0
   40616: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   4061b: 48 8b 45 d0                  	movq	-0x30(%rbp), %rax
   4061f: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   40624: 0f 28 45 c0                  	movaps	-0x40(%rbp), %xmm0
   40628: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   4062c: 4c 8d 7d a0                  	leaq	-0x60(%rbp), %r15
   40630: 4c 89 ff                     	movq	%r15, %rdi
   40633: e8 9c c4 06 00               	callq	0xacad4 <_tan+0xacad4>
   40638: 49 8b 47 10                  	movq	0x10(%r15), %rax
   4063c: 48 8b 4d 10                  	movq	0x10(%rbp), %rcx
   40640: 48 89 41 10                  	movq	%rax, 0x10(%rcx)
   40644: 41 0f 10 07                  	movups	(%r15), %xmm0
   40648: 4c 8b 7d 20                  	movq	0x20(%rbp), %r15
   4064c: 0f 11 01                     	movups	%xmm0, (%rcx)
   4064f: 49 8b 45 00                  	movq	(%r13), %rax
   40653: 4c 89 ef                     	movq	%r13, %rdi
   40656: 4c 89 f6                     	movq	%r14, %rsi
   40659: ff 50 18                     	callq	*0x18(%rax)
   4065c: f2 41 0f 11 07               	movsd	%xmm0, (%r15)
   40661: 48 8b 03                     	movq	(%rbx), %rax
   40664: 48 89 df                     	movq	%rbx, %rdi
   40667: 4c 89 f6                     	movq	%r14, %rsi
   4066a: ff 50 18                     	callq	*0x18(%rax)
   4066d: f2 41 0f 11 47 18            	movsd	%xmm0, 0x18(%r15)
   40673: 4c 89 e6                     	movq	%r12, %rsi
   40676: 4c 89 65 90                  	movq	%r12, -0x70(%rbp)
   4067a: 4c 8b 65 18                  	movq	0x18(%rbp), %r12
   4067e: 49 c7 04 24 00 00 00 00      	movq	$0x0, (%r12)
   40686: 48 b8 00 00 00 00 00 00 f0 3f	movabsq	$0x3ff0000000000000, %rax ## imm = 0x3FF0000000000000
   40690: 49 89 44 24 18               	movq	%rax, 0x18(%r12)
   40695: 4d 8d 4c 24 08               	leaq	0x8(%r12), %r9
   4069a: 49 8d 47 08                  	leaq	0x8(%r15), %rax
   4069e: 49 8d 4c 24 10               	leaq	0x10(%r12), %rcx
   406a3: 49 8d 57 10                  	leaq	0x10(%r15), %rdx
   406a7: 4d 89 f0                     	movq	%r14, %r8
   406aa: 4c 8b 75 88                  	movq	-0x78(%rbp), %r14
   406ae: 4d 8b 16                     	movq	(%r14), %r10
   406b1: 48 89 54 24 10               	movq	%rdx, 0x10(%rsp)
   406b6: 48 89 4c 24 08               	movq	%rcx, 0x8(%rsp)
   406bb: 48 89 04 24                  	movq	%rax, (%rsp)
   406bf: 4c 89 f7                     	movq	%r14, %rdi
   406c2: 4c 89 ea                     	movq	%r13, %rdx
   406c5: 48 89 d9                     	movq	%rbx, %rcx
   406c8: 41 ff 92 80 00 00 00         	callq	*0x80(%r10)
   406cf: 48 8b 4d 10                  	movq	0x10(%rbp), %rcx
   406d3: 48 8b 41 10                  	movq	0x10(%rcx), %rax
   406d7: 48 89 45 d0                  	movq	%rax, -0x30(%rbp)
   406db: 0f 10 01                     	movups	(%rcx), %xmm0
   406de: 0f 29 45 c0                  	movaps	%xmm0, -0x40(%rbp)
   406e2: 48 8b 4d 98                  	movq	-0x68(%rbp), %rcx
   406e6: 48 8b 41 10                  	movq	0x10(%rcx), %rax
   406ea: 48 89 45 b0                  	movq	%rax, -0x50(%rbp)
   406ee: 0f 10 01                     	movups	(%rcx), %xmm0
   406f1: 0f 29 45 a0                  	movaps	%xmm0, -0x60(%rbp)
   406f5: 48 8b 45 b0                  	movq	-0x50(%rbp), %rax
   406f9: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   406fe: 0f 28 45 a0                  	movaps	-0x60(%rbp), %xmm0
   40702: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   40707: 48 8b 45 d0                  	movq	-0x30(%rbp), %rax
   4070b: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   40710: 0f 28 45 c0                  	movaps	-0x40(%rbp), %xmm0
   40714: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   40718: 48 8d 9d 70 ff ff ff         	leaq	-0x90(%rbp), %rbx
   4071f: 48 89 df                     	movq	%rbx, %rdi
   40722: e8 b3 c3 06 00               	callq	0xacada <_tan+0xacada>
   40727: 48 8b 43 10                  	movq	0x10(%rbx), %rax
   4072b: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   40730: 66 0f 10 03                  	movupd	(%rbx), %xmm0
   40734: 66 0f 11 04 24               	movupd	%xmm0, (%rsp)
   40739: e8 4e c3 06 00               	callq	0xaca8c <_tan+0xaca8c>
   4073e: f2 0f 10 0d 2a 00 07 00      	movsd	0x7002a(%rip), %xmm1    ## 0xb0770 <__ZTS8OZVertex+0xc>
   40746: f2 0f 5f c8                  	maxsd	%xmm0, %xmm1
   4074a: f2 41 0f 10 56 08            	movsd	0x8(%r14), %xmm2
   40750: f2 41 0f 59 54 24 08         	mulsd	0x8(%r12), %xmm2
   40757: f2 41 0f 11 54 24 08         	movsd	%xmm2, 0x8(%r12)
   4075e: f2 41 0f 10 5e 08            	movsd	0x8(%r14), %xmm3
   40764: f2 41 0f 59 5c 24 10         	mulsd	0x10(%r12), %xmm3
   4076b: f2 0f 58 d8                  	addsd	%xmm0, %xmm3
   4076f: 66 0f 14 d3                  	unpcklpd	%xmm3, %xmm2            ## xmm2 = xmm2[0],xmm3[0]
   40773: f2 0f 12 c1                  	movddup	%xmm1, %xmm0            ## xmm0 = xmm1[0,0]
   40777: 66 0f 5e d0                  	divpd	%xmm0, %xmm2
   4077b: 66 41 0f 11 54 24 08         	movupd	%xmm2, 0x8(%r12)
   40782: f2 41 0f 10 47 08            	movsd	0x8(%r15), %xmm0
   40788: f2 41 0f 59 46 08            	mulsd	0x8(%r14), %xmm0
   4078e: f2 41 0f 10 4f 10            	movsd	0x10(%r15), %xmm1
   40794: f2 41 0f 58 07               	addsd	(%r15), %xmm0
   40799: f2 41 0f 11 47 08            	movsd	%xmm0, 0x8(%r15)
   4079f: f2 41 0f 59 4e 08            	mulsd	0x8(%r14), %xmm1
   407a5: f2 41 0f 58 4f 18            	addsd	0x18(%r15), %xmm1
   407ab: f2 41 0f 11 4f 10            	movsd	%xmm1, 0x10(%r15)
   407b1: 48 8b 45 90                  	movq	-0x70(%rbp), %rax
   407b5: 48 8b 80 a8 00 00 00         	movq	0xa8(%rax), %rax
   407bc: 80 38 00                     	cmpb	$0x0, (%rax)
   407bf: 75 12                        	jne	0x407d3 <__ZN20OZBezierInterpolator16getControlPointsER8OZSplinePvS2_RK6CMTimeRS3_S6_PdS7_+0x289>
   407c1: 80 78 03 01                  	cmpb	$0x1, 0x3(%rax)
   407c5: 75 0c                        	jne	0x407d3 <__ZN20OZBezierInterpolator16getControlPointsER8OZSplinePvS2_RK6CMTimeRS3_S6_PdS7_+0x289>
   407c7: 48 8b 7d 18                  	movq	0x18(%rbp), %rdi
   407cb: 4c 89 fe                     	movq	%r15, %rsi
   407ce: e8 39 4d 06 00               	callq	0xa550c <__Z30OZBezierSanitizeControlPolygonPdS_>
   407d3: 48 81 c4 98 00 00 00         	addq	$0x98, %rsp
   407da: 5b                           	popq	%rbx
   407db: 41 5c                        	popq	%r12
   407dd: 41 5d                        	popq	%r13
   407df: 41 5e                        	popq	%r14
   407e1: 41 5f                        	popq	%r15
   407e3: 5d                           	popq	%rbp
   407e4: c3                           	retq
   407e5: 90                           	nop
