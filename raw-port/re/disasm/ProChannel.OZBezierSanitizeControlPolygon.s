
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000000a550c <__Z30OZBezierSanitizeControlPolygonPdS_>:
   a550c: f2 0f 10 27                  	movsd	(%rdi), %xmm4
   a5510: f2 0f 10 15 e8 b0 00 00      	movsd	0xb0e8(%rip), %xmm2     ## 0xb0600 <__ZTS15OZDynamicSpline+0x24>
   a5518: f2 0f 59 d4                  	mulsd	%xmm4, %xmm2
   a551c: 66 0f 10 5f 08               	movupd	0x8(%rdi), %xmm3
   a5521: 66 0f 28 05 27 c6 00 00      	movapd	0xc627(%rip), %xmm0     ## 0xb1b50 <__ZTS24OZDecelerateInterpolator+0x32>
   a5529: 66 0f 59 c3                  	mulpd	%xmm3, %xmm0
   a552d: 66 0f 28 ca                  	movapd	%xmm2, %xmm1
   a5531: f2 0f 58 c8                  	addsd	%xmm0, %xmm1
   a5535: 66 0f 15 c0                  	unpckhpd	%xmm0, %xmm0            ## xmm0 = xmm0[1,1]
   a5539: f2 0f 5c c8                  	subsd	%xmm0, %xmm1
   a553d: f2 0f 10 47 18               	movsd	0x18(%rdi), %xmm0
   a5542: f2 0f 59 05 36 a0 00 00      	mulsd	0xa036(%rip), %xmm0     ## 0xaf580 <_ProChannelVersionNumber+0x78>
   a554a: f2 0f 58 c1                  	addsd	%xmm1, %xmm0
   a554e: 66 0f 57 ed                  	xorpd	%xmm5, %xmm5
   a5552: 66 0f 2e c5                  	ucomisd	%xmm5, %xmm0
   a5556: 0f 86 b9 01 00 00            	jbe	0xa5715 <__Z30OZBezierSanitizeControlPolygonPdS_+0x209>
   a555c: f2 0f 59 25 1c b2 00 00      	mulsd	0xb21c(%rip), %xmm4     ## 0xb0780 <__ZTS8OZVertex+0x1c>
   a5564: 66 0f 28 0d f4 c5 00 00      	movapd	0xc5f4(%rip), %xmm1     ## 0xb1b60 <__ZTS24OZDecelerateInterpolator+0x42>
   a556c: 66 0f 59 cb                  	mulpd	%xmm3, %xmm1
   a5570: f2 0f 5c e1                  	subsd	%xmm1, %xmm4
   a5574: 66 0f 15 c9                  	unpckhpd	%xmm1, %xmm1            ## xmm1 = xmm1[1,1]
   a5578: f2 0f 58 cc                  	addsd	%xmm4, %xmm1
   a557c: 66 0f 28 25 bc b0 00 00      	movapd	0xb0bc(%rip), %xmm4     ## 0xb0640 <__ZTS15OZDynamicSpline+0x64>
   a5584: 66 0f 57 e1                  	xorpd	%xmm1, %xmm4
   a5588: 66 0f 28 f0                  	movapd	%xmm0, %xmm6
   a558c: f2 0f 58 f0                  	addsd	%xmm0, %xmm6
   a5590: f2 0f 5e e6                  	divsd	%xmm6, %xmm4
   a5594: 66 0f 2e e5                  	ucomisd	%xmm5, %xmm4
   a5598: 0f 82 77 01 00 00            	jb	0xa5715 <__Z30OZBezierSanitizeControlPolygonPdS_+0x209>
   a559e: f2 0f 10 2d 82 9f 00 00      	movsd	0x9f82(%rip), %xmm5     ## 0xaf528 <_ProChannelVersionNumber+0x20>
   a55a6: 66 0f 2e ec                  	ucomisd	%xmm4, %xmm5
   a55aa: 0f 82 65 01 00 00            	jb	0xa5715 <__Z30OZBezierSanitizeControlPolygonPdS_+0x209>
   a55b0: 55                           	pushq	%rbp
   a55b1: 48 89 e5                     	movq	%rsp, %rbp
   a55b4: 41 56                        	pushq	%r14
   a55b6: 53                           	pushq	%rbx
   a55b7: 48 83 ec 10                  	subq	$0x10, %rsp
   a55bb: 48 89 f3                     	movq	%rsi, %rbx
   a55be: 49 89 fe                     	movq	%rdi, %r14
   a55c1: f2 0f 59 1d b7 9f 00 00      	mulsd	0x9fb7(%rip), %xmm3     ## 0xaf580 <_ProChannelVersionNumber+0x78>
   a55c9: f2 0f 58 d3                  	addsd	%xmm3, %xmm2
   a55cd: 48 8d 7d e0                  	leaq	-0x20(%rbp), %rdi
   a55d1: 48 8d 75 e8                  	leaq	-0x18(%rbp), %rsi
   a55d5: 66 0f 57 db                  	xorpd	%xmm3, %xmm3
   a55d9: e8 9a 76 00 00               	callq	0xacc78 <_tan+0xacc78>
   a55de: 83 f8 02                     	cmpl	$0x2, %eax
   a55e1: 0f 85 26 01 00 00            	jne	0xa570d <__Z30OZBezierSanitizeControlPolygonPdS_+0x201>
   a55e7: 66 41 0f 10 0e               	movupd	(%r14), %xmm1
   a55ec: f2 41 0f 10 46 08            	movsd	0x8(%r14), %xmm0
   a55f2: f2 41 0f 10 56 18            	movsd	0x18(%r14), %xmm2
   a55f8: 66 0f 28 da                  	movapd	%xmm2, %xmm3
   a55fc: f2 41 0f 5c 5e 10            	subsd	0x10(%r14), %xmm3
   a5602: f2 0f 5c c1                  	subsd	%xmm1, %xmm0
   a5606: 66 0f 28 e8                  	movapd	%xmm0, %xmm5
   a560a: f2 0f 5c eb                  	subsd	%xmm3, %xmm5
   a560e: 66 0f 28 25 7a ad 00 00      	movapd	0xad7a(%rip), %xmm4     ## 0xb0390 <__ZTS13OZCoreGlobals+0x19>
   a5616: 66 0f 54 e5                  	andpd	%xmm5, %xmm4
   a561a: f2 0f 10 35 8e ad 00 00      	movsd	0xad8e(%rip), %xmm6     ## 0xb03b0 <__ZTS13OZCoreGlobals+0x39>
   a5622: 66 0f 2e f4                  	ucomisd	%xmm4, %xmm6
   a5626: 76 12                        	jbe	0xa563a <__Z30OZBezierSanitizeControlPolygonPdS_+0x12e>
   a5628: f2 0f 10 25 90 ad 00 00      	movsd	0xad90(%rip), %xmm4     ## 0xb03c0 <__ZTS13OZCoreGlobals+0x49>
   a5630: f2 0f 10 3d f0 9e 00 00      	movsd	0x9ef0(%rip), %xmm7     ## 0xaf528 <_ProChannelVersionNumber+0x20>
   a5638: eb 38                        	jmp	0xa5672 <__Z30OZBezierSanitizeControlPolygonPdS_+0x166>
   a563a: 66 0f 28 e0                  	movapd	%xmm0, %xmm4
   a563e: f2 0f 59 e3                  	mulsd	%xmm3, %xmm4
